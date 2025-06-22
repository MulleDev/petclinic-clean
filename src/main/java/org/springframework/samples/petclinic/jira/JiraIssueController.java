package org.springframework.samples.petclinic.jira;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Jira Issues", description = "API zur automatischen Erstellung von Jira-Tickets")
@RestController
@RequestMapping("/api/jira/issues")
public class JiraIssueController {

	@Autowired
	private JiraIssueService jiraIssueService;

	@Operation(summary = "Erstellt ein Jira-Ticket",
			description = "Legt ein neues Issue in Jira mit den angegebenen Feldern an.")
	@PostMapping
	public ResponseEntity<String> createIssue(@RequestBody JiraIssueRequest request) {
		String result = jiraIssueService.createIssue(request);
		return ResponseEntity.ok(result);
	}

}
