package com.scms.controller;

import com.scms.dto.LoginRequest;
import com.scms.dto.LoginResponse;
import com.scms.dto.RegisterResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.service.AuthService;
import com.scms.service.ProfilePictureService;
import com.scms.security.ClientIpResolver;
import com.scms.service.LoginSecurityService.LoginRequestMetadata;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final ProfilePictureService profilePictureService;
    private final ClientIpResolver clientIpResolver;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String userAgent = httpRequest.getHeader("User-Agent");

        return ResponseEntity.ok(authService.login(
                request,
                LoginRequestMetadata.of(clientIpResolver.resolve(httpRequest), userAgent)
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless; client simply discards the token.
        return ResponseEntity.ok().build();
    }

    @PutMapping(
            value = "/me/profile-picture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> updateProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws Exception {
        String objectKey = profilePictureService.updateProfilePicture(authentication.getName(), file);

        return ResponseEntity.ok(Map.of(
                "message", "Profile picture updated successfully",
                "objectKey", objectKey,
                "profilePictureUrl", "/api/v1/auth/me/profile-picture"
        ));
    }

    @GetMapping("/me/profile-picture")
    public ResponseEntity<InputStreamResource> getProfilePicture(Authentication authentication)
            throws Exception {
        ProfilePictureService.ProfilePictureContent picture =
                profilePictureService.getProfilePicture(authentication.getName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(picture.contentType()))
                .contentLength(picture.size())
                .cacheControl(CacheControl.noStore())
                .body(new InputStreamResource(picture.inputStream()));
    }

    @GetMapping("/available")
    public String greeting() {
        return "Hello world, the spring boot security is ready for use";
    }
}
