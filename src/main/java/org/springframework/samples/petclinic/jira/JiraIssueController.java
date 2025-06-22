package org.springframework.samples.petclinic.jira;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.HttpStatus;

@Tag(name = "Jira Issues", description = "API zur automatischen Erstellung von Jira-Tickets")
@RestController
@RequestMapping("/api/jira/issues")
@Validated
public class JiraIssueController {

	@Autowired
	private JiraIssueService jiraIssueService;

	@Operation(summary = "Erstellt ein Jira-Ticket",
			description = "Legt ein neues Issue in Jira mit den angegebenen Feldern an.")
	@PostMapping
	public ResponseEntity<?> createIssue(@Valid @RequestBody JiraIssueRequest request) {
		String result = jiraIssueService.createIssue(request);
		return ResponseEntity.ok(result);
	}

	@Operation(summary = "Jira-Issue abfragen",
			description = "Liefert die wichtigsten Infos zu einem Jira-Ticket (Summary, Description, Status, Komponenten, Labels, Kommentare)")
	@GetMapping("/{issueKey}")
	public ResponseEntity<?> getIssue(@PathVariable String issueKey) {
		return jiraIssueService.getIssue(issueKey);
	}

	@Operation(summary = "Kommentar zu Jira-Issue hinzufügen",
			description = "Fügt einem bestehenden Jira-Ticket einen Kommentar hinzu.")
	@PostMapping("/{issueKey}/comments")
	public ResponseEntity<?> addComment(@PathVariable String issueKey, @Valid @RequestBody JiraCommentRequest request) {
		return jiraIssueService.addComment(issueKey, request);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseEntity<String> handleValidationExceptions(MethodArgumentNotValidException ex) {
		StringBuilder sb = new StringBuilder("Validierungsfehler: ");
		ex.getBindingResult()
			.getFieldErrors()
			.forEach(error -> sb.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; "));
		return ResponseEntity.badRequest().body(sb.toString());
	}

}
