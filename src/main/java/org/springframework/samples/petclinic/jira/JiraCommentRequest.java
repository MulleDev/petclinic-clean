package org.springframework.samples.petclinic.jira;

import jakarta.validation.constraints.NotBlank;

public class JiraCommentRequest {

	@NotBlank(message = "comment ist Pflicht")
	private String comment;

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

}
