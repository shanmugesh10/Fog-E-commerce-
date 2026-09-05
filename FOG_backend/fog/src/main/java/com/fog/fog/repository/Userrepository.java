package com.fog.fog.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import  com.fog.fog.model.User;

public interface  Userrepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
