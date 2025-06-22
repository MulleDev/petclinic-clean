package org.springframework.samples.petclinic.jira;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import java.util.*;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;

@Service
public class JiraIssueService {

	@Value("${jira.url}")
	protected String jiraUrl;

	@Value("${jira.bot-user}")
	protected String jiraUser;

	@Value("${jira.bot-password}")
	protected String jiraPassword;

	protected WebClient webClient;

	private static final Logger logger = LoggerFactory.getLogger(JiraIssueService.class);

	private static final ObjectMapper objectMapper = new ObjectMapper();

	public JiraIssueService() {
		this.webClient = WebClient.builder().build();
	}

	@Retry(name = "jiraIssueRetry", fallbackMethod = "createIssueFallback")
	public String createIssue(JiraIssueRequest request) {
		String url = jiraUrl + "/rest/api/2/issue";
		String auth = jiraUser + ":" + jiraPassword;
		String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());

		Map<String, Object> fields = new HashMap<>();
		// Standardfelder
		fields.put("project", Map.of("key", request.getProjectKey()));
		fields.put("summary", request.getSummary());
		fields.put("description", request.getDescription());
		fields.put("issuetype", Map.of("name", request.getIssueType()));
		if (request.getComponents() != null && !request.getComponents().isEmpty()) {
			List<Map<String, String>> comps = new ArrayList<>();
			for (String c : request.getComponents())
				comps.add(Map.of("name", c));
			fields.put("components", comps);
		}
		if (request.getLabels() != null)
			fields.put("labels", request.getLabels());

		// Dynamisches Mapping für Custom Fields
		if (request.getEpicLink() != null) {
			String jiraField = JiraFieldMappingConfig.getJiraField("epicLink");
			// Nur setzen, wenn das Feld im Request gesetzt ist UND im
			// Jira-Projekt/Screensetup existiert
			if (jiraField != null && request.getEpicLink() != null && !request.getEpicLink().isBlank()) {
				fields.put(jiraField, request.getEpicLink());
			}
			else {
				logger.info("Feld 'epicLink' wird nicht gesetzt, da kein Mapping oder Wert vorhanden.");
			}
		}
		if (request.getAcceptanceCriteria() != null) {
			String jiraField = JiraFieldMappingConfig.getJiraField("acceptanceCriteria");
			// Nur setzen, wenn das Feld im Request gesetzt ist UND im
			// Jira-Projekt/Screensetup existiert
			if (jiraField != null && request.getAcceptanceCriteria() != null
					&& !request.getAcceptanceCriteria().isBlank()) {
				fields.put(jiraField, request.getAcceptanceCriteria());
			}
			else {
				logger.info("Feld 'acceptanceCriteria' wird nicht gesetzt, da kein Mapping oder Wert vorhanden.");
			}
		}

		Map<String, Object> body = Map.of("fields", fields);
		try {
			String response = webClient.post()
				.uri(url)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.header(HttpHeaders.AUTHORIZATION, basicAuth)
				.bodyValue(body)
				.retrieve()
				.bodyToMono(String.class)
				.block();
			// Response validieren: Enthält sie ein Jira-Issue-Key?
			JsonNode json = objectMapper.readTree(response);
			if (json.hasNonNull("key")) {
				logger.info("Jira Issue created: {}", response);
				return response;
			}
			else {
				logger.error("Jira Issue creation: Erfolgreiche Response, aber kein Issue-Key enthalten! Response: {}",
						response);
				throw new RuntimeException(
						"Jira Issue creation: Erfolgreiche Response, aber kein Issue-Key enthalten!");
			}
		}
		catch (WebClientResponseException ex) {
			HttpStatusCode status = ex.getStatusCode();
			String responseBody = ex.getResponseBodyAsString();
			if (status.value() == 401 || status.value() == 403) {
				logger.error("Jira Authentifizierungsfehler ({}): {} | Body: {}", status, ex.getMessage(),
						responseBody);
				// RuntimeException werfen, damit Retry/Fallback greift
				throw new RuntimeException("Jira Authentifizierungsfehler: " + ex.getMessage(), ex);
			}
			else if (status.is4xxClientError()) {
				logger.error("Jira Client-Fehler ({}): {} | Body: {}", status, ex.getMessage(), responseBody);
				throw new RuntimeException("Jira Client-Fehler: " + ex.getMessage(), ex);
			}
			else if (status.is5xxServerError()) {
				logger.error("Jira Server-Fehler ({}): {} | Body: {}", status, ex.getMessage(), responseBody);
				throw new RuntimeException("Jira Server-Fehler: " + ex.getMessage(), ex);
			}
			throw ex;
		}
		catch (Exception ex) {
			logger.error("Jira Issue creation error: {}", ex.getMessage());
			throw new RuntimeException("Jira Issue creation error: " + ex.getMessage(), ex);
		}
	}

	// Fallback-Methode für Retry
	public String createIssueFallback(JiraIssueRequest request, Throwable t) {
		logger.error("Jira Issue creation failed after retries: {}", t.getMessage());
		throw new RuntimeException("Jira Issue creation failed after retries", t);
	}

	public ResponseEntity<?> getIssue(String issueKey) {
		String url = jiraUrl + "/rest/api/2/issue/" + issueKey + "?expand=renderedFields,fields,comment";
		String auth = jiraUser + ":" + jiraPassword;
		String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());
		try {
			String response = webClient.get()
				.uri(url)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.header(HttpHeaders.AUTHORIZATION, basicAuth)
				.retrieve()
				.bodyToMono(String.class)
				.block();
			return ResponseEntity.ok(response);
		}
		catch (WebClientResponseException ex) {
			if (ex.getStatusCode().value() == 404) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue nicht gefunden: " + issueKey);
			}
			return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
		}
		catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fehler: " + ex.getMessage());
		}
	}

	public ResponseEntity<?> addComment(String issueKey, JiraCommentRequest request) {
		String url = jiraUrl + "/rest/api/2/issue/" + issueKey + "/comment";
		String auth = jiraUser + ":" + jiraPassword;
		String basicAuth = "Basic " + Base64.getEncoder().encodeToString(auth.getBytes());
		Map<String, Object> body = Map.of("body", request.getComment());
		try {
			String response = webClient.post()
				.uri(url)
				.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.header(HttpHeaders.AUTHORIZATION, basicAuth)
				.bodyValue(body)
				.retrieve()
				.bodyToMono(String.class)
				.block();
			return ResponseEntity.ok(response);
		}
		catch (WebClientResponseException ex) {
			if (ex.getStatusCode().value() == 404) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Issue nicht gefunden: " + issueKey);
			}
			return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
		}
		catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fehler: " + ex.getMessage());
		}
	}

}
