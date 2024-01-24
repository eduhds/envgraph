package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const PORT = ":8090"

func getApiEnv(c *gin.Context) {
	rootDir := os.Getenv("HOME")

	files, err := filepath.Glob(rootDir + "/**/**/**/*.env*")

	if err != nil {
		//log.Fatal(err)
	}

	c.JSON(200, gin.H{
		"message": "teste",
		"envs":    files,
	})
}

func main() {
	fmt.Println("Running at http://localhost" + PORT)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Content-Length"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        12 * time.Hour,
	}))

	router.Static("/app", "./dist")

	router.Any("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/app")
	})

	router.GET("/api/env", getApiEnv)

	server := &http.Server{
		Addr:           PORT,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	server.ListenAndServe()
}
