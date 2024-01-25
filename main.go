package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const PORT = ":8090"

func getApiEnv(c *gin.Context) {
	rootDir := os.Getenv("HOME")
	var files []string = []string{}

	envPath := c.Query("path")

	if envPath != "" {
		envContent := ""

		content, err := os.ReadFile("/" + envPath)

		if err != nil {
			log.Fatal(err)
		} else {
			envContent = string(content)
		}

		c.JSON(200, gin.H{
			"content": envContent,
		})

		return
	}

	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Println(err)
			return nil
		}

		if info.IsDir() {
			if strings.HasPrefix(info.Name(), ".") ||
				info.Name() == "Applications" ||
				info.Name() == "Library" ||
				info.Name() == "node_modules" ||
				info.Name() == "dist" ||
				info.Name() == "build" ||
				info.Name() == "vendor" {
				return filepath.SkipDir
			}
		}

		reg, err2 := regexp.Compile("^\\.(.{0,})env(.{0,})")

		if err2 != nil {
			return err2
		}

		if reg.MatchString(info.Name()) {
			files = append(files, path)
		}

		return nil
	})

	if err != nil {
		log.Fatal(err)
	}

	c.JSON(200, gin.H{
		"envs": files,
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
		ReadTimeout:    30 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	server.ListenAndServe()
}
