package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

const (
	PORT           = "8080"
	BROKER_URL     = "http://localhost:4000/subscribe"
	SELF_URL       = "http://localhost:8080/events"
	TOPIC_ORDER    = "ORDER_CREATED"
)

func main() {
	// 1. Subscribe to Message Broker on startup
	go subscribeToBroker()

	// 2. Setup HTTP Server
	http.HandleFunc("/events", handleEvent)
	http.HandleFunc("/menu", getMenu)

	fmt.Printf("[Restaurant Service] Starting on port %s...\n", PORT)
	log.Fatal(http.ListenAndServe(":"+PORT, nil))
}

func subscribeToBroker() {
	// Wait a bit for Broker to start if running simultaneously
	time.Sleep(2 * time.Second)

	payload := map[string]string{
		"topic": TOPIC_ORDER,
		"url":   SELF_URL,
	}
	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post(BROKER_URL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("❌ Failed to subscribe to broker: %v\n", err)
		return
	}
	defer resp.Body.Close()
	fmt.Println("✅ Subscribed to ORDER_CREATED events")
}

func handleEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var data map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("\n🔔 [Restaurant Service] RECEIVED EVENT: %v\n", data)
	fmt.Println("   -> Preparing food...")
	
	w.WriteHeader(http.StatusOK)
}

func getMenu(w http.ResponseWriter, r *http.Request) {
	menu := map[string]float64{
		"Pizza":  12.99,
		"Burger": 8.99,
		"Soda":   2.50,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(menu)
}
