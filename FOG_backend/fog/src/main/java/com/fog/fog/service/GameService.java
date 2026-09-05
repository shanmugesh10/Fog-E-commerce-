package com.fog.fog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fog.fog.model.Game;
import com.fog.fog.repository.Gamerepository;

@Service
public class GameService {

    private final Gamerepository gameRepository;

    public GameService(Gamerepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Game getGameById(Long id) {
        return gameRepository.findById(id).orElse(null);
    }

    public Game saveGame(Game game) {
        return gameRepository.save(game);
    }

    public void deleteGame(Long id) {
        gameRepository.deleteById(id);
    }
}
