-- =====================================================
-- MIGRATION 004: SEED DATA
-- Populate tables with demo data from Mission, TX clinic
-- Run in Supabase SQL Editor AFTER migrations 001-003
-- =====================================================

-- =====================================================
-- PROVIDERS (Wound Care Specialists - Mission, TX)
-- =====================================================
INSERT INTO providers (provider_id, first_name, last_name, credentials, npi, tax_id, license_number, specialty_type, taxonomy_code, phone, email, facility, city, state, zip) VALUES
(1, 'Jose', 'Farias-Jimenez', 'MD', '1234701890', '74-1234567', 'TX-WC-12345', 'Wound Care', '207R00000X', '(956) 555-0101', 'jfarias@vsrwoundcare.com', 'VSR Luis M Reyes M', 'Mission', 'TX', '78572'),
(2, 'Ernesto M', 'Garza Jr', 'MD', '1234702891', '74-1234568', 'TX-WC-12346', 'Wound Care', '207R00000X', '(956) 555-0102', 'egarza@vsrwoundcare.com', 'VSR Luis M Reyes M', 'Mission', 'TX', '78572'),
(3, 'Reinaldo II', 'Morales', 'MD', '1234703892', '74-1234569', 'TX-WC-12347', 'Wound Care', '207R00000X', '(956) 555-0103', 'rmorales@vsrwoundcare.com', 'VSR Luis M Reyes M', 'Mission', 'TX', '78572'),
(4, 'Luis M', 'Reyes', 'MD', '1234704893', '74-1234570', 'TX-WC-12348', 'Wound Care', '207R00000X', '(956) 555-0104', 'lreyes@vsrwoundcare.com', 'VSR Luis M Reyes M', 'Mission', 'TX', '78572'),
(5, 'Sarah', 'Johnson', 'MD', '1234567890', '12-3456789', 'TX-IM-54321', 'Internal Medicine', '207R00000X', '(555) 234-5678', 'sjohnson@example.com', 'Valley Medical Center', 'McAllen', 'TX', '78501'),
(6, 'Michael', 'Chen', 'DO', '1234567891', '12-3456790', 'TX-FM-54322', 'Family Medicine', '207Q00000X', '(555) 345-6789', 'mchen@example.com', 'Rio Grande Family Clinic', 'McAllen', 'TX', '78501'),
(7, 'Ana', 'Rodriguez', 'MD', '1234567892', '12-3456791', 'TX-PD-54323', 'Pediatrics', '208000000X', '(555) 456-7890', 'arodriguez@example.com', 'Valley Pediatrics', 'Mission', 'TX', '78572');

-- Reset sequence
SELECT setval('providers_provider_id_seq', (SELECT MAX(provider_id) FROM providers));

-- =====================================================
-- PATIENTS
-- Pedro Suarez + Demo Patients
-- =====================================================
INSERT INTO patients (patient_id, account_no, first_name, last_name, date_of_birth, gender, address_line1, city, state, zip, county, phone_home, phone_mobile, email, marital_status, preferred_language, race, ethnicity, pcp_provider_id, account_balance, patient_balance, propensity_to_pay_score, preferred_contact_method, optimal_contact_time, no_show_history, distance_miles) VALUES
(1, 'MRN-9609', 'Pedro', 'Suarez', '1974-06-23', 'M', '5505 LUCY DR', 'MISSION', 'TX', '78574-6225', 'Hidalgo', '956-569-5822', '956-555-0001', 'pedro.suarez@email.com', 'Married', 'English', 'White', 'Hispanic Or Latino', 1, 1228.00, 724.08, 0.72, 'phone', 'morning', 0, 5.2),
(2, 'MRN-1001', 'Maria', 'Garcia', '1985-03-15', 'F', '1200 Main St', 'McAllen', 'TX', '78501', 'Hidalgo', '956-555-1001', '956-555-1002', 'maria.garcia@email.com', 'Single', 'Spanish', 'White', 'Hispanic Or Latino', 5, 450.00, 150.00, 0.85, 'phone', 'afternoon', 1, 12.3),
(3, 'MRN-1002', 'James', 'Wilson', '1968-11-08', 'M', '789 Oak Ave', 'Mission', 'TX', '78572', 'Hidalgo', '956-555-2001', '956-555-2002', 'jwilson@email.com', 'Married', 'English', 'Black', 'Not Hispanic', 6, 2100.00, 890.00, 0.45, 'email', 'morning', 3, 8.7),
(4, 'MRN-1003', 'Kim', 'Nguyen', '1992-07-22', 'F', '456 Elm St', 'McAllen', 'TX', '78501', 'Hidalgo', '956-555-3001', '956-555-3002', 'knguyen@email.com', 'Single', 'English', 'Asian', 'Not Hispanic', 7, 175.00, 50.00, 0.92, 'text', 'evening', 0, 15.1),
(5, 'MRN-1004', 'Roberto', 'Martinez', '1955-01-30', 'M', '321 Pine Rd', 'Edinburg', 'TX', '78539', 'Hidalgo', '956-555-4001', NULL, 'rmartinez@email.com', 'Widowed', 'Spanish', 'White', 'Hispanic Or Latino', 5, 3200.00, 1100.00, 0.38, 'phone', 'morning', 2, 22.5);

SELECT setval('patients_patient_id_seq', (SELECT MAX(patient_id) FROM patients));

-- =====================================================
-- GUARANTORS
-- =====================================================
INSERT INTO guarantors (patient_id, relationship_to_patient, first_name, last_name) VALUES
(1, 'Self', 'Pedro', 'Suarez'),
(2, 'Self', 'Maria', 'Garcia'),
(3, 'Self', 'James', 'Wilson'),
(4, 'Parent', 'Tran', 'Nguyen'),
(5, 'Self', 'Roberto', 'Martinez');

-- =====================================================
-- PATIENT INSURANCE
-- =====================================================
INSERT INTO patient_insurance (patient_id, insurance_order, payer_name, payer_id, electronic_payer_id, plan_name, plan_type, member_id, group_number, effective_date, copay_amount, coinsurance_percent, deductible_amount, deductible_met, oop_max, oop_met, eligibility_status, historical_denial_rate, avg_reimbursement_rate, timely_filing_limit_days) VALUES
(1, 'primary', 'Medicare of Texas', 'MEDTX', '00590', 'Medicare Part B', 'Medicare', '1EG4-TE5-MK72', NULL, '2020-01-01', 0.00, 20.00, 233.00, 233.00, 7550.00, 2100.00, 'active', 0.08, 0.80, 365),
(2, 'primary', 'Blue Cross Blue Shield TX', 'BCBSTX', '00630', 'PPO Gold', 'Commercial', 'XYZ-123456', 'GRP-9876', '2024-01-01', 30.00, 20.00, 1500.00, 800.00, 6000.00, 1200.00, 'active', 0.12, 0.85, 90),
(3, 'primary', 'Aetna', 'AETNA', '00450', 'HMO Standard', 'Commercial', 'W987654321', 'GRP-5432', '2023-06-01', 40.00, 30.00, 2000.00, 500.00, 8000.00, 800.00, 'active', 0.15, 0.78, 120),
(3, 'secondary', 'Medicare of Texas', 'MEDTX', '00590', 'Medicare Part B', 'Medicare', '2EG4-TE5-JW88', NULL, '2023-01-01', 0.00, 20.00, 233.00, 233.00, 7550.00, 3500.00, 'active', 0.08, 0.80, 365),
(4, 'primary', 'United Healthcare', 'UHC', '00480', 'Choice Plus', 'Commercial', 'U112233445', 'GRP-7788', '2024-03-01', 25.00, 15.00, 1000.00, 200.00, 5000.00, 400.00, 'active', 0.10, 0.88, 90),
(5, 'primary', 'Medicare of Texas', 'MEDTX', '00590', 'Medicare Part B', 'Medicare', '3EG4-TE5-RM55', NULL, '2020-07-01', 0.00, 20.00, 233.00, 233.00, 7550.00, 4800.00, 'active', 0.08, 0.80, 365);

-- =====================================================
-- ENCOUNTERS (Sample appointments)
-- =====================================================
INSERT INTO encounters (encounter_id, patient_id, provider_id, encounter_date, start_time, visit_type, status, place_of_service, chief_complaint, em_code, no_show_risk_score) VALUES
(1, 1, 1, CURRENT_DATE, '09:00', 'WOUND', 'checked-in', '11', 'Wound care follow-up, left lower leg ulcer', '99214', 0.12),
(2, 2, 5, CURRENT_DATE, '10:30', 'OFFICE', 'scheduled', '11', 'Annual physical exam', '99395', 0.25),
(3, 3, 6, CURRENT_DATE, '11:00', 'FOLLOW-UP', 'scheduled', '11', 'Diabetes follow-up, A1C review', '99213', 0.55),
(4, 4, 7, CURRENT_DATE + 1, '08:30', 'OFFICE', 'scheduled', '11', 'Well-child visit, 12 months', '99392', 0.08),
(5, 5, 1, CURRENT_DATE + 1, '14:00', 'WOUND', 'scheduled', '11', 'Wound debridement, right heel pressure ulcer', '99215', 0.42),
(6, 1, 2, CURRENT_DATE - 7, '09:00', 'WOUND', 'completed', '11', 'Wound care assessment, initial visit', '99204', 0.15),
(7, 3, 6, CURRENT_DATE - 14, '10:00', 'FOLLOW-UP', 'completed', '11', 'Diabetes management', '99214', 0.50);

SELECT setval('encounters_encounter_id_seq', (SELECT MAX(encounter_id) FROM encounters));

-- =====================================================
-- ENCOUNTER DIAGNOSES
-- =====================================================
INSERT INTO encounter_diagnoses (encounter_id, icd10_code, description, display_order, is_primary, is_hcc) VALUES
(1, 'L97.929', 'Non-pressure chronic ulcer of unspecified part of left lower leg', 1, true, true),
(1, 'E11.621', 'Type 2 diabetes with foot ulcer', 2, false, true),
(2, 'Z00.00', 'Encounter for general adult medical examination', 1, true, false),
(3, 'E11.65', 'Type 2 diabetes with hyperglycemia', 1, true, true),
(3, 'I10', 'Essential hypertension', 2, false, false),
(5, 'L89.619', 'Pressure ulcer of right heel, unspecified stage', 1, true, true),
(5, 'I96', 'Gangrene, not elsewhere classified', 2, false, true),
(6, 'L97.929', 'Non-pressure chronic ulcer of left lower leg', 1, true, true),
(7, 'E11.65', 'Type 2 diabetes with hyperglycemia', 1, true, true);

-- =====================================================
-- ENCOUNTER PROCEDURES
-- =====================================================
INSERT INTO encounter_procedures (encounter_id, cpt_code, description, quantity, fee, modifier1, diagnosis_pointer) VALUES
(1, '97597', 'Debridement, open wound, first 20 sq cm', 1, 185.00, NULL, '1,2'),
(1, '97598', 'Debridement, open wound, each additional 20 sq cm', 1, 95.00, NULL, '1,2'),
(2, '99395', 'Preventive visit, 18-39 years', 1, 250.00, NULL, '1'),
(3, '99214', 'Office visit, est patient, moderate complexity', 1, 175.00, NULL, '1,2'),
(3, '83036', 'Hemoglobin A1C', 1, 45.00, NULL, '1'),
(5, '11042', 'Debridement, subcutaneous tissue, first 20 sq cm', 1, 225.00, NULL, '1,2'),
(6, '99204', 'Office visit, new patient, moderate complexity', 1, 295.00, NULL, '1'),
(7, '99214', 'Office visit, est patient, moderate complexity', 1, 175.00, NULL, '1');

-- =====================================================
-- CLAIMS
-- =====================================================
INSERT INTO claims (claim_id, patient_id, encounter_id, provider_id, claim_number, status, service_date, rendering_provider_npi, payer_name, payer_id, member_id, total_charge, paid_amount, patient_responsibility, diagnosis_codes, procedure_codes, denial_risk_score, requires_authorization) VALUES
(1, 1, 6, 2, 'CLM-2025-0001', 'paid', CURRENT_DATE - 7, '1234702891', 'Medicare of Texas', 'MEDTX', '1EG4-TE5-MK72', 295.00, 236.00, 59.00, '["L97.929"]', '["99204"]', 0.08, false),
(2, 3, 7, 6, 'CLM-2025-0002', 'denied', CURRENT_DATE - 14, '1234567891', 'Aetna', 'AETNA', 'W987654321', 175.00, 0.00, 175.00, '["E11.65", "I10"]', '["99214"]', 0.65, false),
(3, 1, 1, 1, 'CLM-2025-0003', 'draft', CURRENT_DATE, '1234701890', 'Medicare of Texas', 'MEDTX', '1EG4-TE5-MK72', 280.00, 0.00, 0.00, '["L97.929", "E11.621"]', '["97597", "97598"]', 0.12, false),
(4, 5, 5, 1, 'CLM-2025-0004', 'draft', CURRENT_DATE + 1, '1234701890', 'Medicare of Texas', 'MEDTX', '3EG4-TE5-RM55', 225.00, 0.00, 0.00, '["L89.619", "I96"]', '["11042"]', 0.22, false);

SELECT setval('claims_claim_id_seq', (SELECT MAX(claim_id) FROM claims));

-- =====================================================
-- PAYMENTS
-- =====================================================
INSERT INTO payments (claim_id, patient_id, payment_date, payment_type, payment_method, payment_amount, adjustment_amount, payer_name, reconciled) VALUES
(1, 1, CURRENT_DATE - 3, 'insurance', 'ERA', 236.00, 0.00, 'Medicare of Texas', true),
(1, 1, CURRENT_DATE - 1, 'patient', 'credit_card', 59.00, 0.00, NULL, false);

-- =====================================================
-- DENIALS
-- =====================================================
INSERT INTO denials (claim_id, denial_date, denial_reason, carc_code, rarc_code, denial_category, routed_to_department, status, denied_amount) VALUES
(2, CURRENT_DATE - 10, 'Missing referral for specialist visit', '4', 'N362', 'authorization', 'Front Desk', 'open', 175.00);

-- =====================================================
-- SERVICE AUTHORIZATIONS
-- =====================================================
INSERT INTO service_authorizations (patient_id, auth_number, payer_name, authorization_type, status, service_description, cpt_codes, diagnosis_codes, requested_date, approved_date, effective_date, expiration_date, visits_approved, visits_used, ordering_provider_id, servicing_provider_id) VALUES
(1, 'AUTH-2025-WC-001', 'Medicare of Texas', 'wound_care', 'approved', 'Wound care debridement series', '["97597", "97598", "11042"]', '["L97.929", "E11.621"]', CURRENT_DATE - 30, CURRENT_DATE - 28, CURRENT_DATE - 28, CURRENT_DATE + 60, 12, 2, 1, 1),
(5, 'AUTH-2025-WC-002', 'Medicare of Texas', 'wound_care', 'approved', 'Pressure ulcer treatment', '["11042", "97597"]', '["L89.619", "I96"]', CURRENT_DATE - 14, CURRENT_DATE - 12, CURRENT_DATE - 12, CURRENT_DATE + 75, 8, 0, 1, 1);
