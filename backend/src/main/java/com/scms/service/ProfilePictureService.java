package com.scms.service;

import com.scms.config.minio.MinioBuckets;
import com.scms.entity.Users;
import com.scms.exception.ResourceNotFoundException;
import com.scms.repository.UserRepository;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class ProfilePictureService {

    private static final Logger log = LoggerFactory.getLogger(ProfilePictureService.class);
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private final MinioClient minioClient;
    private final UserRepository userRepository;

    public ProfilePictureService(MinioClient minioClient, UserRepository userRepository) {
        this.minioClient = minioClient;
        this.userRepository = userRepository;
    }

    public String updateProfilePicture(String email, MultipartFile file) throws Exception {
        ImageType imageType = validateAndDetermineImageType(file);
        Users user = findUser(email);
        String previousObjectKey = user.getProfilePictureKey();
        String objectKey = "users/" + user.getId() + "/profile/" + UUID.randomUUID()
                + imageType.extension();

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(MinioBuckets.PROFILE_PICTURES)
                    .object(objectKey)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(imageType.contentType())
                    .build());
        }

        user.setProfilePictureKey(objectKey);
        try {
            userRepository.saveAndFlush(user);
        } catch (RuntimeException exception) {
            user.setProfilePictureKey(previousObjectKey);
            deleteQuietly(objectKey);
            throw exception;
        }

        if (previousObjectKey != null && !previousObjectKey.isBlank()
                && !previousObjectKey.equals(objectKey)) {
            deleteQuietly(previousObjectKey);
        }

        return objectKey;
    }

    public ProfilePictureContent getProfilePicture(String email) throws Exception {
        Users user = findUser(email);
        String objectKey = user.getProfilePictureKey();
        if (objectKey == null || objectKey.isBlank()) {
            throw new ResourceNotFoundException("Profile picture not found");
        }

        StatObjectResponse metadata = minioClient.statObject(StatObjectArgs.builder()
                .bucket(MinioBuckets.PROFILE_PICTURES)
                .object(objectKey)
                .build());
        GetObjectResponse object = minioClient.getObject(GetObjectArgs.builder()
                .bucket(MinioBuckets.PROFILE_PICTURES)
                .object(objectKey)
                .build());

        String contentType = metadata.contentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return new ProfilePictureContent(object, contentType, metadata.size());
    }

    private Users findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private ImageType validateAndDetermineImageType(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile picture is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Profile picture must not exceed 5 MB");
        }

        try (InputStream inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(12);
            if (isJpeg(header)) {
                return ImageType.JPEG;
            }
            if (isPng(header)) {
                return ImageType.PNG;
            }
            if (isWebp(header)) {
                return ImageType.WEBP;
            }
        }

        throw new IllegalArgumentException("Only valid JPEG, PNG, and WebP images are allowed");
    }

    private boolean isJpeg(byte[] header) {
        return header.length >= 3
                && (header[0] & 0xFF) == 0xFF
                && (header[1] & 0xFF) == 0xD8
                && (header[2] & 0xFF) == 0xFF;
    }

    private boolean isPng(byte[] header) {
        return header.length >= 8
                && (header[0] & 0xFF) == 0x89
                && header[1] == 'P'
                && header[2] == 'N'
                && header[3] == 'G'
                && (header[4] & 0xFF) == 0x0D
                && (header[5] & 0xFF) == 0x0A
                && (header[6] & 0xFF) == 0x1A
                && (header[7] & 0xFF) == 0x0A;
    }

    private boolean isWebp(byte[] header) {
        return header.length >= 12
                && header[0] == 'R'
                && header[1] == 'I'
                && header[2] == 'F'
                && header[3] == 'F'
                && header[8] == 'W'
                && header[9] == 'E'
                && header[10] == 'B'
                && header[11] == 'P';
    }

    private void deleteQuietly(String objectKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(MinioBuckets.PROFILE_PICTURES)
                    .object(objectKey)
                    .build());
        } catch (Exception exception) {
            log.warn("Unable to delete profile picture object {}", objectKey, exception);
        }
    }

    public record ProfilePictureContent(InputStream inputStream, String contentType, long size) {
    }

    private enum ImageType {
        JPEG("image/jpeg", ".jpg"),
        PNG("image/png", ".png"),
        WEBP("image/webp", ".webp");

        private final String contentType;
        private final String extension;

        ImageType(String contentType, String extension) {
            this.contentType = contentType;
            this.extension = extension;
        }

        String contentType() {
            return contentType;
        }

        String extension() {
            return extension;
        }
    }
}
