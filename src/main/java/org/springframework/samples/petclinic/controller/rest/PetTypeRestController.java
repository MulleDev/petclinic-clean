package org.springframework.samples.petclinic.controller.rest;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.samples.petclinic.model.PetType;
import org.springframework.samples.petclinic.repository.PetTypeRepository;

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

	@PutMapping("/{id}")
	public ResponseEntity<PetType> updatePetType(@PathVariable Integer id, @RequestBody PetType petType) {
		return petTypeRepository.findById(id).map(existing -> {
			existing.setName(petType.getName());
			existing.setDescription(petType.getDescription());
			PetType saved = petTypeRepository.save(existing);
			return ResponseEntity.ok(saved);
		}).orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletePetType(@PathVariable Integer id) {
		if (!petTypeRepository.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		petTypeRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}

}
