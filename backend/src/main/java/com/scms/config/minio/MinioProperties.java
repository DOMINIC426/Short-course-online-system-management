package com.scms.config.minio;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "scms.minio")
public record MinioProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        List<String> buckets
) {
}