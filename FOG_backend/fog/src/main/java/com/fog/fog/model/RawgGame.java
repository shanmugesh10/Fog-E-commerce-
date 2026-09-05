package com.fog.fog.model;
class RawgGame{
    private Long id;
    private String name;
    private String released;
    private String background_img;
    public Long getId(){
        return id;
    }
    public String getName(){
        return name;
    } 
    public String getReleased(){
        return released;
    } 
    public String getBackground_img(){
        return background_img;
    } 
    public void setName(String name){
        this.name=name;
    }
    public void setReleased(String released){
        this.released=released;
    } 
    public void setBackground_img(String background_img){
        this.background_img=background_img;
        
    }
}