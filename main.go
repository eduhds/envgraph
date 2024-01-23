package main

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func getApiEnv(c *gin.Context) {
	files, err := filepath.Glob("/home/**/*.env*")

	if err != nil {
		//log.Fatal(err)
	}

	for _, file := range files {
		fmt.Println(file)
	}

	c.JSON(200, gin.H{
		"message": "teste",
		"envs":    files,
	})
}

func main() {
	fmt.Println("Hello, World!")

	router := gin.Default()

	router.Static("/app", "./dist")

	router.GET("/api/env", getApiEnv)

	server := &http.Server{
		Addr:           ":8090",
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	server.ListenAndServe()
}
