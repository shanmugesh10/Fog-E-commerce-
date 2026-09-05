package com.fog.fog.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
@Entity
public class Game{
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private Long rawgId;
    private String name;
    private Double  price;
    private String genre;
    private String imageUrl;
    public Long getId(){
        return id;
    }
    public Long getRawgId(){
        return id;
    }
    public String getName(){
        return name;
    }
      public String getGenre(){
        return genre;
    }
      public String getImageUrl(){
        return imageUrl;
    }
    public Double getPrice(){
        return price;
    }
    public void setRawgId(Long rawgId){
        this.rawgId=rawgId;
    }
    public void setName(String name){
        this.name=name;
    }
    public void setPrice(Double price){
        this.price=price;
    }
    public void setGenre(String genre){
        this.genre=genre;
    }
    public void setImageurl(String imageUrl){
        this.imageUrl=imageUrl;
    }
}