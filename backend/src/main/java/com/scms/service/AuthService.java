package com.scms.service;


import com.scms.dto.LoginRequest;
import com.scms.dto.RegisterResponse;
import com.scms.dto.RegisterUserRequest;
import com.scms.entity.Users;

import com.scms.entity.enums.Role;
import com.scms.exception.UserAlreadyExistException;
import com.scms.jwt.JwtService;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.websocket.AuthenticationException;
import org.modelmapper.ModelMapper;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDate;

@RequiredArgsConstructor
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager manger;

    //************************* REGISTER USER ******************
    public RegisterResponse register(RegisterUserRequest request){
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistException("This email is already registered , got to login page");
        }

        Users users =modelMapper.map(request,Users.class);
        users.setCreatedAt(LocalDate.now());
        users.setUpdatedAt(LocalDate.now());
        users.setPassword(passwordEncoder.encode(request.getPassword()));
        users.setRole(Role.STUDENT);

        Users savedUser = userRepository.save(users);
      String token =  jwtService.generateToken(savedUser.getEmail());

        return modelMapper.map(savedUser,RegisterResponse.class);
    }


    public String login(LoginRequest loginRequest){

        Authentication authentication = manger.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),loginRequest.getPassword()));

        if(!authentication.isAuthenticated()){
            return "failed";
    }

        return jwtService.generateToken(loginRequest.getEmail());

}

}

