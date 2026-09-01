package com.fog.fog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fog.fog.model.Game;

public interface Gamerepository extends JpaRepository<Game,Long>{

}