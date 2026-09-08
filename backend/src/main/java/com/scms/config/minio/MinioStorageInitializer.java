package com.scms.config.minio;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MinioStorageInitializer {

    private static final Logger log =
            LoggerFactory.getLogger(MinioStorageInitializer.class);

    private final MinioClient minioClient;

    public MinioStorageInitializer(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initialize() throws Exception {

        createBucketIfNotExists(
                MinioBuckets.PROFILE_PICTURES
        );

        log.info("MinIO storage initialization completed.");
    }

    private void createBucketIfNotExists(String bucketName)
            throws Exception {

        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );

        if (!exists) {

            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            log.info(
                    "Created MinIO bucket: {}",
                    bucketName
            );

        } else {

            log.info(
                    "MinIO bucket already exists: {}",
                    bucketName
            );
        }
    }
}