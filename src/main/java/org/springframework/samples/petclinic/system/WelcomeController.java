/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.samples.petclinic.system;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import org.springframework.samples.petclinic.model.Owner;
import org.springframework.samples.petclinic.repository.OwnerRepository;

@Controller
class WelcomeController {

	private final OwnerRepository ownerRepository;

	public WelcomeController(OwnerRepository ownerRepository) {
		this.ownerRepository = ownerRepository;
	}

	@GetMapping("/")
	public String welcome(Model model) {
		model.addAttribute("owner", new Owner());
		return "welcome";
	}

	/**
	 * Quick search for owners from homepage Returns JSON for AJAX requests or redirects
	 * to owner details/list
	 */
	@PostMapping("/search")
	@ResponseBody
	public OwnerSearchResult searchOwners(@RequestParam("searchTerm") String searchTerm) {
		if (searchTerm == null || searchTerm.trim().isEmpty()) {
			return new OwnerSearchResult(List.of(), 0, "Suchbegriff darf nicht leer sein");
		}

		// Suche nach Nachnamen (existing functionality)
		Pageable pageable = PageRequest.of(0, 10); // First 10 results
		Page<Owner> owners = ownerRepository.findByLastNameStartingWith(searchTerm.trim(), pageable);

		if (owners.isEmpty()) {
			return new OwnerSearchResult(List.of(), 0, "Keine Besitzer gefunden");
		}

		return new OwnerSearchResult(owners.getContent(), (int) owners.getTotalElements(), null);
	}

	/**
	 * GET endpoint for search compatibility
	 */
	@GetMapping("/search")
	public String searchOwnersGet(@RequestParam("searchTerm") String searchTerm, Model model) {
		if (searchTerm == null || searchTerm.trim().isEmpty()) {
			model.addAttribute("searchError", "Suchbegriff darf nicht leer sein");
			model.addAttribute("owner", new Owner());
			return "welcome";
		}

		// Redirect to existing owners search with lastName parameter
		return "redirect:/owners?lastName=" + searchTerm.trim();
	}

	/**
	 * Response DTO for AJAX search results
	 */
	public static class OwnerSearchResult {

		private final List<OwnerDto> owners;

		private final int totalCount;

		private final String errorMessage;

		public OwnerSearchResult(List<Owner> owners, int totalCount, String errorMessage) {
			this.owners = owners.stream()
				.map(owner -> new OwnerDto(owner.getId(), owner.getFirstName(), owner.getLastName(), owner.getCity()))
				.toList();
			this.totalCount = totalCount;
			this.errorMessage = errorMessage;
		}

		public List<OwnerDto> getOwners() {
			return owners;
		}

		public int getTotalCount() {
			return totalCount;
		}

		public String getErrorMessage() {
			return errorMessage;
		}

		public boolean getHasError() {
			return errorMessage != null;
		}

		public boolean getEmpty() {
			return owners.isEmpty();
		}

	}

	/**
	 * DTO for owner search results
	 */
	public static class OwnerDto {

		private final Integer id;

		private final String firstName;

		private final String lastName;

		private final String city;

		public OwnerDto(Integer id, String firstName, String lastName, String city) {
			this.id = id;
			this.firstName = firstName;
			this.lastName = lastName;
			this.city = city;
		}

		public Integer getId() {
			return id;
		}

		public String getFirstName() {
			return firstName;
		}

		public String getLastName() {
			return lastName;
		}

		public String getCity() {
			return city;
		}

		public String getFullName() {
			return firstName + " " + lastName;
		}

	}

}
