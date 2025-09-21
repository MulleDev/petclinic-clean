/**
 * Test Utility Functions für PetClinic
 * Stellt wiederverwendbare Funktionen für Unit Tests bereit
 */

// ===================== PET TYPE UTILITIES =====================

export interface PetTypeData {
  name: string;
  description: string;
}

/**
 * Validiert PetType-Datenstruktur
 */
export function validatePetTypeData(petType: PetTypeData): boolean {
  if (!petType || typeof petType !== 'object') {
    return false;
  }
  
  if (!petType.name || typeof petType.name !== 'string' || petType.name.trim().length === 0) {
    return false;
  }
  
  if (!petType.description || typeof petType.description !== 'string' || petType.description.trim().length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Generiert zufällige PetType-Testdaten
 */
export function generateRandomPetTypeData(): PetTypeData {
  const petTypes = [
    { name: 'Dog', description: 'Loyal and friendly companion' },
    { name: 'Cat', description: 'Independent and graceful pet' },
    { name: 'Bird', description: 'Colorful and singing companion' },
    { name: 'Fish', description: 'Quiet and peaceful aquatic pet' },
    { name: 'Rabbit', description: 'Soft and gentle herbivore' },
    { name: 'Hamster', description: 'Small and active rodent' },
    { name: 'Guinea Pig', description: 'Social and vocal companion' },
    { name: 'Ferret', description: 'Playful and energetic mammal' },
    { name: 'Turtle', description: 'Slow and steady companion' },
    { name: 'Snake', description: 'Quiet and low-maintenance reptile' }
  ];
  
  const randomIndex = Math.floor(Math.random() * petTypes.length);
  const basePetType = petTypes[randomIndex];
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  return {
    name: `${basePetType.name}_${timestamp}_${randomSuffix}`,
    description: `${basePetType.description} (Test ${timestamp})`
  };
}

/**
 * Erstellt PetType-URLs
 */
export function buildPetTypeUrl(): string {
  return '/verwaltung/pettypes';
}

/**
 * Bereinigt PetType-Formulardaten
 */
export function cleanPetTypeFormData(data: any): PetTypeData {
  return {
    name: data.name ? data.name.toString().trim() : '',
    description: data.description ? data.description.toString().trim() : ''
  };
}

/**
 * Validiert PetType-Name-Eindeutigkeit (Mock für Tests)
 */
export function validatePetTypeNameUniqueness(name: string, existingNames: string[]): boolean {
  return !existingNames.includes(name.toLowerCase());
}

/**
 * Formatiert PetType-Namen
 */
export function formatPetTypeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Validiert erforderliche PetType-Felder
 */
export function validatePetTypeRequiredFields(petType: PetTypeData): string[] {
  const errors: string[] = [];
  
  if (!petType.name || petType.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!petType.description || petType.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  return errors;
}

/**
 * Sortiert PetTypes alphabetisch
 */
export function sortPetTypesAlphabetically(petTypes: PetTypeData[]): PetTypeData[] {
  return [...petTypes].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filtert PetTypes nach Suchbegriff
 */
export function filterPetTypesBySearchTerm(petTypes: PetTypeData[], searchTerm: string): PetTypeData[] {
  const term = searchTerm.toLowerCase();
  return petTypes.filter(petType => 
    petType.name.toLowerCase().includes(term) || 
    petType.description.toLowerCase().includes(term)
  );
}

/**
 * Zählt PetTypes
 */
export function countPetTypes(petTypes: PetTypeData[]): number {
  return petTypes.length;
}

// ===================== VET UTILITIES =====================

export interface VetData {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  specialties?: string[];
}

/**
 * Validiert Vet-Datenstruktur
 */
export function validateVetData(vet: VetData): boolean {
  if (!vet || typeof vet !== 'object') {
    return false;
  }
  
  if (!vet.firstName || typeof vet.firstName !== 'string' || vet.firstName.trim().length === 0) {
    return false;
  }
  
  if (!vet.lastName || typeof vet.lastName !== 'string' || vet.lastName.trim().length === 0) {
    return false;
  }
  
  if (!vet.email || typeof vet.email !== 'string' || !isValidEmail(vet.email)) {
    return false;
  }
  
  if (!vet.telephone || typeof vet.telephone !== 'string' || vet.telephone.trim().length === 0) {
    return false;
  }
  
  return true;
}

/**
 * Formatiert Telefonnummern
 */
export function formatTelephoneNumber(phoneNumber: string): string {
  // Entferne alle nicht-numerischen Zeichen
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Formatiere als XXX-XXX-XXXX
  if (cleaned.length >= 10) {
    const area = cleaned.slice(-10, -7);
    const prefix = cleaned.slice(-7, -4);
    const number = cleaned.slice(-4);
    return `${area}-${prefix}-${number}`;
  }
  
  return phoneNumber;
}

/**
 * Validiert E-Mail-Format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generiert einzigartige Vet-Testdaten
 */
export function generateUniqueVetTestData(): VetData {
  const firstNames = ['James', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Ashley'];
  const lastNames = ['Carter', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson', 'Mcdonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford', 'Henry', 'Boyd', 'Mason', 'Morales', 'Kennedy', 'Warren', 'Dixon', 'Ramos', 'Reyes', 'Burns', 'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Hunt', 'Black', 'Daniels', 'Palmer', 'Mills', 'Nichols', 'Grant', 'Knight', 'Ferguson', 'Rose', 'Stone', 'Hawkins', 'Dunn', 'Perkins', 'Hudson', 'Spencer', 'Gardner', 'Stephens', 'Payne', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray', 'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews', 'Ruiz', 'Harper', 'Fox', 'Riley', 'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence', 'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson', 'Fields', 'Gutierrez', 'Ryan', 'Schmidt', 'Carr', 'Vasquez', 'Castillo', 'Wheeler', 'Chapman', 'Oliver', 'Montgomery', 'Richards', 'Williamson', 'Johnston', 'Banks', 'Meyer', 'Bishop', 'Mccoy', 'Howell', 'Alvarez', 'Morrison', 'Hansen', 'Fernandez', 'Garza', 'Harvey', 'Little', 'Burton', 'Stanley', 'Nguyen', 'George', 'Jacobs', 'Reid', 'Kim', 'Fuller', 'Lynch', 'Dean', 'Gilbert', 'Garrett', 'Romero', 'Welch', 'Larson', 'Frazier', 'Burke', 'Hanson', 'Day', 'Mendoza', 'Moreno', 'Bowman', 'Medina', 'Fowler', 'Brewer', 'Hoffman', 'Carlson', 'Silva', 'Pearson', 'Holland', 'Douglas'];
  const specialties = ['Cardiology', 'Surgery', 'Dermatology', 'Neurology', 'Oncology', 'Orthopedics'];
  
  // Add timestamp and random number for uniqueness
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    firstName: `${firstName}_${timestamp}`,
    lastName: `${lastName}_${randomNum}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${timestamp}@petclinic.com`,
    telephone: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    specialties: [specialties[Math.floor(Math.random() * specialties.length)]]
  };
}

/**
 * Erstellt Vet-URLs
 */
export function buildVetUrls(): string {
  return '/verwaltung/vets';
}

/**
 * Behandelt Specialty-Daten
 */
export function handleSpecialtyData(specialties: string[]): string[] {
  return specialties.filter(specialty => specialty.trim().length > 0);
}

/**
 * Bereinigt Vet-Formulardaten
 */
export function cleanVetFormData(data: any): VetData {
  return {
    firstName: data.firstName ? data.firstName.toString().trim() : '',
    lastName: data.lastName ? data.lastName.toString().trim() : '',
    email: data.email ? data.email.toString().trim().toLowerCase() : '',
    telephone: data.telephone ? formatTelephoneNumber(data.telephone.toString()) : '',
    specialties: data.specialties ? handleSpecialtyData(data.specialties) : []
  };
}

/**
 * Validiert erforderliche Vet-Felder
 */
export function validateVetRequiredFields(vet: VetData): string[] {
  const errors: string[] = [];
  
  if (!vet.firstName || vet.firstName.trim().length === 0) {
    errors.push('First name is required');
  }
  
  if (!vet.lastName || vet.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }
  
  if (!vet.email || !isValidEmail(vet.email)) {
    errors.push('Valid email is required');
  }
  
  if (!vet.telephone || vet.telephone.trim().length === 0) {
    errors.push('Telephone is required');
  }
  
  return errors;
}

// ===================== OWNER UTILITIES =====================

export interface OwnerData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  email?: string;
}

/**
 * Validiert Owner-Daten
 */
export function validateOwnerData(owner: OwnerData): boolean {
  if (!owner || typeof owner !== 'object') {
    return false;
  }
  
  const requiredFields = ['firstName', 'lastName', 'address', 'city', 'telephone'];
  
  for (const field of requiredFields) {
    if (!owner[field as keyof OwnerData] || 
        typeof owner[field as keyof OwnerData] !== 'string' || 
        (owner[field as keyof OwnerData] as string).trim().length === 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validiert Telefonnummer-Format
 */
export function validateTelephoneFormat(telephone: string): boolean {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(telephone) || /^\d{10}$/.test(telephone.replace(/\D/g, ''));
}

/**
 * Generiert Owner-Selector
 */
export function generateOwnerSelector(ownerId: string): string {
  return `[data-owner-id="${ownerId}"]`;
}

/**
 * Bereinigt Owner-Formulardaten
 */
export function cleanOwnerFormData(data: any): OwnerData {
  return {
    firstName: data.firstName ? data.firstName.toString().trim() : '',
    lastName: data.lastName ? data.lastName.toString().trim() : '',
    address: data.address ? data.address.toString().trim() : '',
    city: data.city ? data.city.toString().trim() : '',
    telephone: data.telephone ? formatTelephoneNumber(data.telephone.toString()) : '',
    email: data.email ? data.email.toString().trim().toLowerCase() : undefined
  };
}

/**
 * Erstellt Navigation-URLs
 */
export function buildNavigationUrls(): Record<string, string> {
  return {
    owners: '/owners',
    findOwners: '/owners/find',
    addOwner: '/owners/new',
    vets: '/vets',
    home: '/'
  };
}

/**
 * Validiert Menü-Zustände
 */
export function validateMenuStates(menuState: Record<string, boolean>): boolean {
  const requiredMenus = ['home', 'owners', 'vets'];
  return requiredMenus.every(menu => typeof menuState[menu] === 'boolean');
}

/**
 * Erkennt Formular-Änderungen
 */
export function detectFormChanges(originalData: any, currentData: any): boolean {
  const keys = Object.keys(originalData);
  return keys.some(key => originalData[key] !== currentData[key]);
}

/**
 * Ermittelt erforderliche Feld-Fehler
 */
export function getRequiredFieldErrors(data: any, requiredFields: string[]): string[] {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
      errors.push(`${field} is required`);
    }
  });
  
  return errors;
}

/**
 * Generiert zufällige Owner-Daten
 */
export function generateRandomOwnerData(): OwnerData {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller'];
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Cedar Ln'];
  const cities = ['Springfield', 'Riverside', 'Franklin', 'Georgetown', 'Madison'];
  
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  
  return {
    firstName: `${firstNames[Math.floor(Math.random() * firstNames.length)]}_${timestamp}`,
    lastName: `${lastNames[Math.floor(Math.random() * lastNames.length)]}_${randomNum}`,
    address: `${Math.floor(Math.random() * 9999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
    city: cities[Math.floor(Math.random() * cities.length)],
    telephone: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  };
}

/**
 * Generiert einzigartige Testdaten
 */
export function generateUniqueTestData(): OwnerData {
  return generateRandomOwnerData();
}
