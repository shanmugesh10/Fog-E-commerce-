package com.fog.fog.controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fog.fog.dto.LoginRequest;
import com.fog.fog.model.User;
import com.fog.fog.service.UserService;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/users")
public class UserController{
    private final UserService userService;

    public  UserController(UserService userService){
        this.userService=userService;
    }
    @PostMapping 
    public User createUser(@RequestBody User user){
        return userService.saveUser(user);
    }
    @PostMapping("/login")
    public String loginUser(@RequestBody LoginRequest request) {
        boolean success= userService.loginUser(request.getEmail(),request.getPassword());
        if(success){
            return "Login successful";
        }
        return "Invalid email or password";
    }
    
} 