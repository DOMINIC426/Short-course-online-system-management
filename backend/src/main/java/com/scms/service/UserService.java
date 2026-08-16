package com.scms.service;


import com.scms.dto.RegisterResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.entity.Users;

import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;

import org.springframework.stereotype.Service;


import java.time.LocalDate;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    //************************* REGISTER USER ******************
    public RegisterResponse register(RegisterUserRequest request){
        Users users =modelMapper.map(request,Users.class);
        users.setCreatedAt(LocalDate.now());
        users.setUpdatedAt(LocalDate.now());

        Users savedUser = userRepository.save(users);

        return modelMapper.map(savedUser,RegisterResponse.class);
    }
}

