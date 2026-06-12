# Task:  NestJS Healthcare Facility Registry Import 

Create a complete NestJS module that imports Nigeria NHFR facility registry Excel/CSV sheets into an existing terminology framework.

## Existing System - /Users/john/develop/rxsoft/healthcare-concepts

The system already contains:

```ts
ConceptCodingEntity
ConceptAttributeValueEntity
ExternalConceptMappingEntity
```

`ConceptCodingEntity` is used for reference/master data and code systems.

Example:

```ts
concept
code
name
shortName
longName
```

## Available Sheets

### facility

Contains:

```text
facility_id
unique_id
state_unique_id
registration_no
start_date
close_date
facility_name
alt_facility_name
state_code
lga_code
ward_code
ownership_code
ownership_type_code
facility_level_code
facility_level_option_code
facility_level_options_category_code
physical_location
postal_address
longitude
latitude
phone_number
alternate_number
email_address
website
operational_days
operational_hours
operational_status_id
registration_status_code
license_status_code
outpatient
inpatient
doctors
pharmacists
dentist
pharmacy_technicians
nurses
lab_scientists
midwifes
lab_technicians
nurse_midwife
him_officers
community_health_officer
community_extension_workers
jun_community_extension_worker
dental_technicians
env_health_officers
attendants
beds
onsite_laboratory
onsite_imaging
onsite_pharmarcy
mortuary_services
ambulance_services
facility_type_id
...
```

### facility_type

```text
code
name
```

### facility_level_option

```text
code
name
```

### state

```text
code
name
```

### lga

```text
code
name
```

### ward

```text
code
name
```

---

# Architecture Requirements

Do NOT store facilities inside ConceptCodingEntity.

Facilities are business entities and must have their own table.

Create:

```ts
FacilityEntity
FacilityAttributeEntity
FacilityImportService
FacilityImportController
FacilityImportModule
```

---

# Import Order

Implement dependency-aware import order: - evaluate or find and create dependent sheets, colums and values if missing

1. States
2. LGAs
3. Wards
4. Facility Types
5. Facility Levels
6. Ownership Types
7. Operational Statuses
8. Registration Statuses
9. License Statuses
10. Facilities

The importer must automatically import missing reference data before importing facilities.

---

# Concept Codes

Import these into ConceptCodingEntity:

## STATE

```text
state.code
state.name
```

## LGA

```text
lga.code
lga.name
```

## WARD

```text
ward.code
ward.name
```

## FACILITY_TYPE

```text
facility_type.code
facility_type.name
```

## FACILITY_LEVEL

```text
facility_level_option.code
facility_level_option.name
```

## OWNERSHIP_TYPE

Derived from facility sheet.

## OPERATIONAL_STATUS

Derived from facility sheet.

## REGISTRATION_STATUS

Derived from facility sheet.

## LICENSE_STATUS

Derived from facility sheet.

---

# Hierarchy Metadata

Store administrative hierarchy using ConceptAttributeValueEntity.

Example:

LGA:

```text
concept=LGA
code=1761

attribute:
state_code=136
```

Ward:

```text
concept=WARD
code=19176

attributes:
state_code=136
lga_code=1761
```

This allows hierarchy traversal without creating separate state/lga/ward tables.

---

# Facility Entity Design

Create a dedicated FacilityEntity.

Important searchable/filterable fields must be physical columns.

Example:

```ts
id
facilityId
uniqueId
registrationNo

facilityName
alternativeName

stateCode
lgaCode
wardCode

facilityTypeCode
facilityLevelCode

ownershipCode
ownershipTypeCode

operationalStatusCode
registrationStatusCode
licenseStatusCode

latitude
longitude

phoneNumber
alternateNumber
emailAddress
website

outpatient
inpatient

createdAt
updatedAt
```

Create indexes for:

```ts
stateCode
lgaCode
wardCode
facilityTypeCode
facilityLevelCode
ownershipTypeCode
operationalStatusCode
```

---

# Facility Attributes

Everything that is not frequently filtered should become FacilityAttributeEntity records.

Examples:

```text
beds

doctors
pharmacists
dentists
nurses
midwives

lab_scientists
lab_technicians

community_health_officer
community_extension_workers

attendants

onsite_laboratory
onsite_imaging
onsite_pharmacy

mortuary_services
ambulance_services

physical_location
postal_address

operational_days
operational_hours
```

Store as:

```ts
facilityId
attributeCode
value
```

Support:

```ts
string
number
boolean
date
```

---

# Import Behaviour

Requirements:

* Idempotent imports
* Upsert by code for concept data
* Upsert by facility_id for facilities
* Batch processing
* Transaction support
* Import progress logging
* Validation
* Duplicate detection
* Import summary report

Example report:

```json
{
  "states": 37,
  "lgas": 774,
  "wards": 9881,
  "facilityTypes": 24,
  "facilitiesCreated": 32891,
  "facilitiesUpdated": 123,
  "errors": 2
}
```

---

# NestJS Deliverables

Generate:

* facility Module structure
* Entities
* DTOs
* Repositories
* Services
* Controllers
* Import orchestration service
* Import workflow diagram
* TypeORM migrations
* Example API endpoints
* Example import execution command


