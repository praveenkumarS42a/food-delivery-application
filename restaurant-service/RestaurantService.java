import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;

public class RestaurantService {
    private static final int PORT = 8080;
    private static final String BROKER_URL = "http://localhost:4000/subscribe";
    private static final String SELF_URL = "http://localhost:8080/events";

    public static void main(String[] args) throws IOException {
        // 1. Subscribe to Broker (Async)
        new Thread(RestaurantService::subscribeToBroker).start();

        // 2. Start HTTP Server
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/events", new EventHandler());
        server.createContext("/menu", new MenuHandler());
        server.setExecutor(null);
        
        System.out.println("[Restaurant Service - Java] Starting on port " + PORT);
        server.start();
    }

    private static void subscribeToBroker() {
        try {
            Thread.sleep(2000); // Wait for broker
            java.net.URL url = new java.net.URL(BROKER_URL);
            java.net.HttpURLConnection con = (java.net.HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            String jsonInputString = "{\"topic\": \"ORDER_CREATED\", \"url\": \"" + SELF_URL + "\"}";
            
            try(OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);           
            }

            int code = con.getResponseCode();
            if (code == 200) {
                System.out.println("✅ Subscribed to ORDER_CREATED events");
            } else {
                System.out.println("❌ Subscription failed: " + code);
            }
        } catch (Exception e) {
            System.out.println("❌ Failed to connect to broker: " + e.getMessage());
        }
    }

    static class EventHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                InputStream is = t.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                System.out.println("\n🔔 [Restaurant Service] RECEIVED EVENT: " + body);
                System.out.println("   -> Preparing food...");
                
                String response = "OK";
                t.sendResponseHeaders(200, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            } else {
                t.sendResponseHeaders(405, -1);
            }
        }
    }

    static class MenuHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            String menu = "{\"Pizza\": 12.99, \"Burger\": 8.99, \"Soda\": 2.50}";
            t.getResponseHeaders().set("Content-Type", "application/json");
            t.sendResponseHeaders(200, menu.length());
            OutputStream os = t.getResponseBody();
            os.write(menu.getBytes());
            os.close();
        }
    }
}
