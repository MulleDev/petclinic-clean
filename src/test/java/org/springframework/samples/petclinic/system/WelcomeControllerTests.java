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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.samples.petclinic.model.Owner;
import org.springframework.samples.petclinic.repository.OwnerRepository;

/**
 * Test class for {@link WelcomeController} including homepage owner search functionality
 * Tests for PET-12: Homepage owner search functionality
 *
 * @author GitHub Copilot
 */
@WebMvcTest(WelcomeController.class)
@DisabledInAotMode
class WelcomeControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private OwnerRepository ownerRepository;

	private Owner testOwner;

	@BeforeEach
	void setUp() {
		testOwner = new Owner();
		testOwner.setId(1);
		testOwner.setFirstName("John");
		testOwner.setLastName("Doe");
		testOwner.setAddress("123 Main St");
		testOwner.setCity("Springfield");
		testOwner.setTelephone("1234567890");
	}

	@Test
	void testWelcomePageLoads() throws Exception {
		mockMvc.perform(get("/"))
			.andExpect(status().isOk())
			.andExpect(view().name("welcome"))
			.andExpect(model().attributeExists("owner"));
	}

	@Test
	void testSearchOwners_ValidTerm_ReturnsResults() throws Exception {
		// Given
		Page<Owner> ownersPage = new PageImpl<>(List.of(testOwner));
		given(ownerRepository.findByLastNameStartingWith(eq("Doe"), any(Pageable.class))).willReturn(ownersPage);

		// When & Then
		mockMvc.perform(post("/search").param("searchTerm", "Doe"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.owners", hasSize(1)))
			.andExpect(jsonPath("$.owners[0].firstName", is("John")))
			.andExpect(jsonPath("$.owners[0].lastName", is("Doe")))
			.andExpect(jsonPath("$.owners[0].city", is("Springfield")))
			.andExpect(jsonPath("$.owners[0].id", is(1)))
			.andExpect(jsonPath("$.totalCount", is(1)))
			.andExpect(jsonPath("$.hasError", is(false)))
			.andExpect(jsonPath("$.empty", is(false)));
	}

	@Test
	void testSearchOwners_EmptyTerm_ReturnsError() throws Exception {
		mockMvc.perform(post("/search").param("searchTerm", ""))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.owners", hasSize(0)))
			.andExpect(jsonPath("$.totalCount", is(0)))
			.andExpect(jsonPath("$.errorMessage", is("Suchbegriff darf nicht leer sein")))
			.andExpect(jsonPath("$.hasError", is(true)))
			.andExpect(jsonPath("$.empty", is(true)));
	}

	@Test
	void testSearchOwners_WhitespaceOnlyTerm_ReturnsError() throws Exception {
		mockMvc.perform(post("/search").param("searchTerm", "   "))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.owners", hasSize(0)))
			.andExpect(jsonPath("$.totalCount", is(0)))
			.andExpect(jsonPath("$.errorMessage", is("Suchbegriff darf nicht leer sein")))
			.andExpect(jsonPath("$.hasError", is(true)))
			.andExpect(jsonPath("$.empty", is(true)));
	}

	@Test
	void testSearchOwners_NoResults_ReturnsEmptyWithMessage() throws Exception {
		// Given
		Page<Owner> emptyPage = new PageImpl<>(List.of());
		given(ownerRepository.findByLastNameStartingWith(eq("NonExistent"), any(Pageable.class))).willReturn(emptyPage);

		// When & Then
		mockMvc.perform(post("/search").param("searchTerm", "NonExistent"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.owners", hasSize(0)))
			.andExpect(jsonPath("$.totalCount", is(0)))
			.andExpect(jsonPath("$.errorMessage", is("Keine Besitzer gefunden")))
			.andExpect(jsonPath("$.hasError", is(true)))
			.andExpect(jsonPath("$.empty", is(true)));
	}

	@Test
	void testSearchOwnersGet_ValidTerm_RedirectsToOwnersList() throws Exception {
		mockMvc.perform(get("/search").param("searchTerm", "Doe"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/owners?lastName=Doe"));
	}

	@Test
	void testSearchOwnersGet_EmptyTerm_ReturnsWelcomeWithError() throws Exception {
		mockMvc.perform(get("/search").param("searchTerm", ""))
			.andExpect(status().isOk())
			.andExpect(view().name("welcome"))
			.andExpect(model().attribute("searchError", "Suchbegriff darf nicht leer sein"))
			.andExpect(model().attributeExists("owner"));
	}

	@Test
	void testOwnerDtoMapping() throws Exception {
		// Given
		Page<Owner> ownersPage = new PageImpl<>(List.of(testOwner));
		given(ownerRepository.findByLastNameStartingWith(eq("Doe"), any(Pageable.class))).willReturn(ownersPage);

		// When & Then - Test DTO fields mapping
		mockMvc.perform(post("/search").param("searchTerm", "Doe"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.owners[0].fullName", is("John Doe")))
			.andExpect(jsonPath("$.owners[0].id", is(1)))
			.andExpect(jsonPath("$.owners[0].firstName", is("John")))
			.andExpect(jsonPath("$.owners[0].lastName", is("Doe")))
			.andExpect(jsonPath("$.owners[0].city", is("Springfield")));
	}

}