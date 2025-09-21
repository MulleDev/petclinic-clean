package org.springframework.samples.petclinic.controller.admin;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.samples.petclinic.model.Vet;
import org.springframework.samples.petclinic.repository.VetRepository;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VetAdminController.class)
class VetAdminControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private VetRepository vetRepository;

	@Test
	@DisplayName("GET /verwaltung/vets shows vet list")
	void listVets() throws Exception {
		Vet vet = new Vet();
		vet.setId(1);
		vet.setFirstName("Anna");
		vet.setLastName("Musterfrau");
		vet.setEmail("anna@example.com");
		vet.setTelephone("123456");
		Mockito.when(vetRepository.findAll()).thenReturn(Arrays.asList(vet));

		mockMvc.perform(get("/verwaltung/vets"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/vets/list"))
			.andExpect(model().attributeExists("vets"));
	}

	@Test
	@DisplayName("GET /verwaltung/vets/new shows empty form")
	void showCreateForm() throws Exception {
		mockMvc.perform(get("/verwaltung/vets/new"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/vets/form"))
			.andExpect(model().attributeExists("vetForm"));
	}

	@Test
	@DisplayName("POST /verwaltung/vets/new with valid data saves vet and redirects")
	void createVetSuccess() throws Exception {
		Mockito.when(vetRepository.save(any(Vet.class))).thenAnswer(i -> {
			Vet v = i.getArgument(0);
			v.setId(42);
			return v;
		});
		mockMvc
			.perform(post("/verwaltung/vets/new").contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.param("firstName", "Max")
				.param("lastName", "Mustermann")
				.param("email", "max@example.com")
				.param("telephone", "123456"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/verwaltung/vets"))
			.andExpect(flash().attribute("success", "vet.saved"));
	}

	@Test
	@DisplayName("POST /verwaltung/vets/new with invalid data shows errors")
	void createVetValidationError() throws Exception {
		mockMvc
			.perform(post("/verwaltung/vets/new").contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.param("firstName", "")
				.param("lastName", "")
				.param("email", "not-an-email")
				.param("telephone", "abc123"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/vets/form"))
			.andExpect(model().attributeHasFieldErrors("vetForm", "firstName", "lastName", "email", "telephone"));
	}

	@Test
	@DisplayName("GET /verwaltung/vets/{id}/edit shows form with vet data")
	void showEditForm() throws Exception {
		Vet vet = new Vet();
		vet.setId(5);
		vet.setFirstName("Edit");
		vet.setLastName("Meier");
		vet.setEmail("edit@example.com");
		vet.setTelephone("987654");
		Mockito.when(vetRepository.findById(eq(5))).thenReturn(vet);

		mockMvc.perform(get("/verwaltung/vets/5/edit"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/vets/form"))
			.andExpect(model().attributeExists("vetForm"));
	}

	@Test
	@DisplayName("POST /verwaltung/vets/{id}/edit with valid data updates vet and redirects")
	void editVetSuccess() throws Exception {
		Mockito.when(vetRepository.save(any(Vet.class))).thenAnswer(i -> i.getArgument(0));
		mockMvc
			.perform(post("/verwaltung/vets/7/edit").contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.param("firstName", "Edit")
				.param("lastName", "Meier")
				.param("email", "edit@example.com")
				.param("telephone", "987654"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/verwaltung/vets"))
			.andExpect(flash().attribute("success", "vet.saved"));
	}

	@Test
	@DisplayName("POST /verwaltung/vets/{id}/edit with invalid data shows errors")
	void editVetValidationError() throws Exception {
		mockMvc
			.perform(post("/verwaltung/vets/7/edit").contentType(MediaType.APPLICATION_FORM_URLENCODED)
				.param("firstName", "")
				.param("lastName", "")
				.param("email", "badmail")
				.param("telephone", "notdigits"))
			.andExpect(status().isOk())
			.andExpect(view().name("verwaltung/vets/form"))
			.andExpect(model().attributeHasFieldErrors("vetForm", "firstName", "lastName", "email", "telephone"));
	}

	@Test
	@DisplayName("GET /verwaltung/vets/{id}/edit with unknown id redirects to list")
	void editFormNotFound() throws Exception {
		Mockito.when(vetRepository.findById(eq(99))).thenReturn(null);
		mockMvc.perform(get("/verwaltung/vets/99/edit"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrl("/verwaltung/vets"));
	}

}
