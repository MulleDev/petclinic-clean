package org.springframework.samples.petclinic.owner;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pet-types")
public class PetTypeRestController {

	private final PetTypeRepository petTypeRepository;

	public PetTypeRestController(PetTypeRepository petTypeRepository) {
		this.petTypeRepository = petTypeRepository;
	}

	@GetMapping
	public List<PetType> getAllPetTypes() {
		return petTypeRepository.findPetTypes();
	}

	@PostMapping
	public ResponseEntity<PetType> createPetType(@RequestBody PetType petType) {
		if (petType.getName() == null || petType.getName().isBlank()) {
			return ResponseEntity.badRequest().build();
		}
		PetType saved = petTypeRepository.save(petType);
		return new ResponseEntity<>(saved, HttpStatus.CREATED);
	}

}
