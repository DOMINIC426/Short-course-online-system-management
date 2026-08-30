package com.scms.service.admin;

import com.scms.dto.admin.SystemSettingRequest;
import com.scms.dto.admin.SystemSettingResponse;
import com.scms.dto.admin.UpdateSystemSettingRequest;
import com.scms.entity.SystemSetting;
import com.scms.exception.UserNotFoundException;
import com.scms.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSystemSettingServiceImpl implements AdminSystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final AuditLogService auditLogService;

    @Override
    public SystemSettingResponse createSetting(
            SystemSettingRequest request
    ) {

        if (systemSettingRepository.existsBySettingKey(
                request.getSettingKey()
        )) {
            throw new IllegalArgumentException(
                    "System setting with key '" +
                            request.getSettingKey() +
                            "' already exists"
            );
        }

        SystemSetting setting = SystemSetting.builder()
                .settingKey(request.getSettingKey())
                .settingValue(request.getSettingValue())
                .description(request.getDescription())
                .build();

        SystemSetting savedSetting =
                systemSettingRepository.save(setting);

        auditLogService.log(
                "CREATE",
                "SYSTEM_SETTING",
                savedSetting.getId(),
                null,
                savedSetting.getSettingKey() +
                        "=" +
                        savedSetting.getSettingValue()
        );

        return mapToResponse(savedSetting);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemSettingResponse> getAllSettings() {

        return systemSettingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemSettingResponse getSettingById(Long id) {

        SystemSetting setting = findSetting(id);

        return mapToResponse(setting);
    }

    @Override
    @Transactional(readOnly = true)
    public SystemSettingResponse getSettingByKey(
            String settingKey
    ) {

        SystemSetting setting = systemSettingRepository
                .findBySettingKey(settingKey)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "System setting with key '" +
                                        settingKey +
                                        "' not found"
                        )
                );

        return mapToResponse(setting);
    }

    @Override
    public SystemSettingResponse updateSetting(
            Long id,
            UpdateSystemSettingRequest request
    ) {

        SystemSetting setting = findSetting(id);

        /*
         * Store old values before updating.
         */
        String oldValue =
                "settingKey=" + setting.getSettingKey() +
                ", settingValue=" + setting.getSettingValue() +
                ", description=" + setting.getDescription();

        setting.setSettingValue(request.getSettingValue());
        setting.setDescription(request.getDescription());

        SystemSetting updatedSetting =
                systemSettingRepository.save(setting);

        String newValue =
                "settingKey=" + updatedSetting.getSettingKey() +
                ", settingValue=" + updatedSetting.getSettingValue() +
                ", description=" + updatedSetting.getDescription();

        auditLogService.log(
                "UPDATE",
                "SYSTEM_SETTING",
                updatedSetting.getId(),
                oldValue,
                newValue
        );

        return mapToResponse(updatedSetting);
    }

    @Override
    public void deleteSetting(Long id) {

        SystemSetting setting = findSetting(id);

        String oldValue =
                "settingKey=" + setting.getSettingKey() +
                ", settingValue=" + setting.getSettingValue() +
                ", description=" + setting.getDescription();

        auditLogService.log(
                "DELETE",
                "SYSTEM_SETTING",
                setting.getId(),
                oldValue,
                null
        );

        systemSettingRepository.delete(setting);
    }

    private SystemSetting findSetting(Long id) {

        return systemSettingRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "System setting not found with id: " + id
                        )
                );
    }

    private SystemSettingResponse mapToResponse(
            SystemSetting setting
    ) {

        return SystemSettingResponse.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}