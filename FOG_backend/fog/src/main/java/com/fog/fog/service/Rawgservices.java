package com.fog.fog.service;
import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
@Service
public class Rawgservices {
    @Value("${rawg.api.key}")
    private String apiKey;
    @Value("${rawg.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getGames(String ordering, String dates) {
    String url = apiUrl + "/games?key=" + apiKey;

    if (ordering != null && !ordering.isBlank()) {
        url += "&ordering=" + java.net.URLEncoder.encode(
            ordering,
            java.nio.charset.StandardCharsets.UTF_8
        );
    }

    if (dates != null && !dates.isBlank()) {
        url += "&dates=" + java.net.URLEncoder.encode(
            dates,
            java.nio.charset.StandardCharsets.UTF_8
        );
    }

   return restTemplate.getForObject(URI.create(url), String.class);
}
    public String getGameDetails(Long id){
        String url= apiUrl + "/games/" + id + "?key=" + apiKey;
        return restTemplate.getForObject(url, String.class);
    }
}
