package org.springframework.samples.petclinic.jira;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.*;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.http.HttpStatusCode;

@Service
public class JiraIssueService {

	@Value("${JIRA_URL}")
	private String jiraUrl;

	@Value("${JIRA_BOT_USER}")
	private String jiraUser;

	@Value("${JIRA_BOT_PASSWORD}")
	private String jiraPassword;

	private final RestTemplate restTemplate = new RestTemplate();

	private static final Logger logger = LoggerFactory.getLogger(JiraIssueService.class);

	@Value("${JIRA_ERROR_MAIL:}")
	private String errorMail;

	private final JavaMailSender mailSender;

	public JiraIssueService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	public String createIssue(JiraIssueRequest request) {
		String url = jiraUrl + "/rest/api/2/issue";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		String auth = jiraUser + ":" + jiraPassword;
		headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString(auth.getBytes()));

		Map<String, Object> fields = new HashMap<>();
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
		if (request.getEpicLink() != null)
			fields.put("customfield_10008", request.getEpicLink()); // Beispiel für
																	// Epic-Link
		if (request.getAcceptanceCriteria() != null)
			fields.put("customfield_10010", request.getAcceptanceCriteria());

		Map<String, Object> body = Map.of("fields", fields);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
		int retries = 3;
		for (int i = 0; i < retries; i++) {
			try {
				ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
				if (response.getStatusCode().is2xxSuccessful()) {
					logger.info("Jira Issue created: {}", response.getBody());
					return response.getBody();
				}
				else {
					logger.error("Jira Issue creation failed: {}", response.getStatusCode());
					if (isCritical(response.getStatusCode())) {
						notifyCritical("Jira Issue creation failed: " + response.getStatusCode());
						break;
					}
				}
			}
			catch (RestClientException ex) {
				logger.error("Jira Issue creation error: {}", ex.getMessage());
				if (i == retries - 1) {
					notifyCritical("Jira Issue creation error: " + ex.getMessage());
				}
				try {
					Thread.sleep(1000 * (i + 1));
				}
				catch (InterruptedException ignored) {
				}
			}
		}
		throw new RuntimeException("Jira Issue creation failed after retries");
	}

	private boolean isCritical(HttpStatusCode status) {
		return status.is5xxServerError();
	}

	@Async
	public void notifyCritical(String message) {
		// Mailversand im lokalen/dev-Profil deaktiviert
		if (System.getProperty("spring.profiles.active", "").matches(".*(dev|local|test).*")
				|| System.getenv().getOrDefault("SPRING_PROFILES_ACTIVE", "").matches(".*(dev|local|test).*")) {
			logger.warn("[DEV/LOCAL] Mailversand deaktiviert: {}", message);
			return;
		}
		if (errorMail != null && !errorMail.isBlank()) {
			SimpleMailMessage mail = new SimpleMailMessage();
			mail.setTo(errorMail);
			mail.setSubject("Jira Issue Creation Error");
			mail.setText(message);
			mailSender.send(mail);
		}
		// Optional: Slack-Integration ergänzen
	}

}
