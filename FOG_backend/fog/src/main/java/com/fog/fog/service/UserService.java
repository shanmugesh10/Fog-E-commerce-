package com.fog.fog.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.fog.fog.model.User;
import com.fog.fog.repository.Userrepository;

@Service
public class UserService {

    private final Userrepository userrepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(Userrepository userrepository) {
        this.userrepository = userrepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User saveUser(User user) {
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        return userrepository.save(user);
    }
    public boolean loginUser(String email,String password){
        User user = userrepository.findByEmail(email).orElse(null);
    if (user == null) {
        return false;
    }
    return passwordEncoder.matches(password, user.getPassword());
    }

}