package org.springframework.samples.petclinic.jira;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JiraIssueServiceTest {
    private static MockWebServer mockWebServer;
    private JiraIssueService jiraIssueService;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeAll
    static void setupServer() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
    }

    @AfterAll
    static void shutdownServer() throws IOException {
        mockWebServer.shutdown();
    }

    @BeforeEach
    void setup() {
        jiraIssueService = new JiraIssueService() {
            {
                this.webClient = WebClient.builder().baseUrl(mockWebServer.url("").toString()).build();
                this.jiraUrl = mockWebServer.url("").toString();
                this.jiraUser = "user";
                this.jiraPassword = "pw";
            }
        };
    }

    @Test
    void createIssue_successful() throws Exception {
        String responseJson = "{\"key\":\"PET-123\"}";
        mockWebServer.enqueue(new MockResponse()
                .setBody(responseJson)
                .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .setResponseCode(201));
        JiraIssueRequest req = new JiraIssueRequest();
        req.setProjectKey("PET");
        req.setSummary("Test");
        req.setDescription("desc");
        req.setIssueType("Story");
        req.setComponents(List.of("Backend"));
        String result = jiraIssueService.createIssue(req);
        assertTrue(result.contains("PET-123"));
    }

    @Test
    void createIssue_noKeyInResponse() {
        mockWebServer.enqueue(new MockResponse()
                .setBody("{}")
                .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .setResponseCode(201));
        JiraIssueRequest req = new JiraIssueRequest();
        req.setProjectKey("PET");
        req.setSummary("Test");
        req.setDescription("desc");
        req.setIssueType("Story");
        Exception ex = assertThrows(RuntimeException.class, () -> jiraIssueService.createIssue(req));
        assertTrue(ex.getMessage().contains("kein Issue-Key"));
    }

    @Test
    void createIssue_authError() {
        mockWebServer.enqueue(new MockResponse().setResponseCode(401));
        JiraIssueRequest req = new JiraIssueRequest();
        req.setProjectKey("PET");
        req.setSummary("Test");
        req.setDescription("desc");
        req.setIssueType("Story");
        Exception ex = assertThrows(RuntimeException.class, () -> jiraIssueService.createIssue(req));
        assertTrue(ex.getMessage().contains("failed after retries"));
    }
}
