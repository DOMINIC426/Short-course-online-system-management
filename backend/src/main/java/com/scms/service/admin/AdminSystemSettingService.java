package com.scms.service.admin;

import com.scms.dto.admin.SystemSettingRequest;
import com.scms.dto.admin.SystemSettingResponse;
import com.scms.dto.admin.UpdateSystemSettingRequest;

import java.util.List;

public interface AdminSystemSettingService {

    SystemSettingResponse createSetting(SystemSettingRequest request);

    List<SystemSettingResponse> getAllSettings();

    SystemSettingResponse getSettingById(Long id);

    SystemSettingResponse getSettingByKey(String settingKey);

    SystemSettingResponse updateSetting(
            Long id,
            UpdateSystemSettingRequest request
    );

    void deleteSetting(Long id);
}