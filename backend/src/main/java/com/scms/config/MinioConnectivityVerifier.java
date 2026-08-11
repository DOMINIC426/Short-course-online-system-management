package com.scms.config;

import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MinioConnectivityVerifier {

    private static final Logger log = LoggerFactory.getLogger(MinioConnectivityVerifier.class);

    private final MinioClient minioClient;

    public MinioConnectivityVerifier(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verifyConnectivity() throws Exception {
        minioClient.listBuckets();
        log.info("MinIO connectivity verified");
    }
}
