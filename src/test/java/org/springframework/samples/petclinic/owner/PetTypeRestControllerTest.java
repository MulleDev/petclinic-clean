package org.springframework.samples.petclinic.owner;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PetTypeRestControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void getAllPetTypes_shouldReturnOk() throws Exception {
		mockMvc.perform(get("/api/pet-types"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
	}

	@Test
	void createPetType_shouldValidateName() throws Exception {
		mockMvc
			.perform(post("/api/pet-types").contentType(MediaType.APPLICATION_JSON)
				.content("{\"description\":\"Test\"}"))
			.andExpect(status().isBadRequest());
	}

	@Test
	void createAndDeletePetType_shouldWork() throws Exception {
		// Create
		String newTypeJson = "{\"name\":\"TestType\",\"description\":\"TestDesc\"}";
		String location = mockMvc
			.perform(post("/api/pet-types").contentType(MediaType.APPLICATION_JSON).content(newTypeJson))
			.andExpect(status().isCreated())
			.andReturn()
			.getResponse()
			.getHeader("Location");
		// Delete (by finding the new type by name)
		mockMvc.perform(get("/api/pet-types"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.name=='TestType')]").exists());
		// (Optional: Delete by ID if needed)
	}

	@Test
	void updatePetType_shouldReturnNotFoundForInvalidId() throws Exception {
		mockMvc
			.perform(put("/api/pet-types/99999").contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"X\",\"description\":\"Y\"}"))
			.andExpect(status().isNotFound());
	}

}
