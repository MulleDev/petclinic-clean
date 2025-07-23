package org.springframework.samples.petclinic.verwaltung;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.samples.petclinic.owner.PetType;
import org.springframework.samples.petclinic.owner.PetTypeRepository;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PetTypeAdminController.class)
class PetTypeAdminControllerTest {

	@Autowired
	MockMvc mockMvc;

	@MockBean
	PetTypeRepository petTypeRepository;

	@Test
	@DisplayName("GET /verwaltung/pettypes liefert die Liste")
	void listPetTypes() throws Exception {
		PetType type = new PetType();
		type.setId(1);
		type.setName("Hund");
		given(petTypeRepository.findPetTypes()).willReturn(List.of(type));
		mockMvc.perform(get("/verwaltung/pettypes"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/pettypes/list"))
			.andExpect(model().attributeExists("petTypes"));
	}

	@Test
	@DisplayName("GET /verwaltung/pettypes/new zeigt das Formular")
	void showCreateForm() throws Exception {
		mockMvc.perform(get("/verwaltung/pettypes/new"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/pettypes/form"))
			.andExpect(model().attributeExists("petType"));
	}

	@Test
	@DisplayName("POST /verwaltung/pettypes/new mit gültigen Daten speichert und leitet um")
	void createPetTypeSuccess() throws Exception {
		mockMvc.perform(post("/verwaltung/pettypes/new").param("name", "Katze").param("description", "Flauschig"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/verwaltung/pettypes"));
	}

	@Test
	@DisplayName("POST /verwaltung/pettypes/new mit Fehler zeigt Formular erneut")
	void createPetTypeValidationError() throws Exception {
		mockMvc.perform(post("/verwaltung/pettypes/new").param("name", "") // Name ist
																			// Pflichtfeld
			.param("description", "Flauschig"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/pettypes/form"))
			.andExpect(model().attributeHasFieldErrors("petType", "name"));
	}

	@Test
	@DisplayName("GET /verwaltung/pettypes/{id}/edit zeigt das Edit-Formular")
	void showEditForm() throws Exception {
		PetType type = new PetType();
		type.setId(2);
		type.setName("Vogel");
		given(petTypeRepository.findById(2)).willReturn(Optional.of(type));
		mockMvc.perform(get("/verwaltung/pettypes/2/edit"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/pettypes/form"))
			.andExpect(model().attributeExists("petType"));
	}

	@Test
	@DisplayName("GET /verwaltung/pettypes/{id}/edit mit ungültiger ID leitet um")
	void showEditFormNotFound() throws Exception {
		given(petTypeRepository.findById(99)).willReturn(Optional.empty());
		mockMvc.perform(get("/verwaltung/pettypes/99/edit"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/verwaltung/pettypes"));
	}

	@Test
	@DisplayName("POST /verwaltung/pettypes/{id}/edit mit gültigen Daten speichert und leitet um")
	void editPetTypeSuccess() throws Exception {
		mockMvc.perform(post("/verwaltung/pettypes/2/edit").param("name", "Vogel").param("description", "Fliegt"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/verwaltung/pettypes"));
	}

	@Test
	@DisplayName("POST /verwaltung/pettypes/{id}/edit mit Fehler zeigt Formular erneut")
	void editPetTypeValidationError() throws Exception {
		mockMvc.perform(post("/verwaltung/pettypes/2/edit").param("name", "").param("description", "Fliegt"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/pettypes/form"))
			.andExpect(model().attributeHasFieldErrors("petType", "name"));
	}

}
