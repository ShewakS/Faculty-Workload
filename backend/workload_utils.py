def normalize_data(raw_data):
    """Normalize multi-subject entries into separate records"""
    normalized = []
    
    for row in raw_data:
        if not row.get('Faculty Name'):
            continue
            
        base_record = {
            'faculty': row['Faculty Name'],
            'department': row['Department'],
            'data_type': row.get('Data Type', 'Real')
        }
        
        # Process up to 9 subjects
        for i in range(1, 10):
            subject_name = row.get(f'S{i}_Subject_Name', '')
            
            if subject_name and subject_name.strip():
                normalized.append({
                    **base_record,
                    'subject': subject_name.strip(),
                    'year': row.get(f'S{i}_Year', ''),
                    'section': row.get(f'S{i}_Section', ''),
                    'teaching_hours': float(row.get(f'S{i}_Teaching_Hours', 0) or 0),
                    'lab_hours': float(row.get(f'S{i}_Lab_Hours', 0) or 0),
                    'evaluation': row.get(f'S{i}_Evaluation_Load', 'Medium')
                })
    
    return normalized

def calculate_workload(normalized_data):
    """Calculate workload scores"""
    evaluation_weights = {'Low': 1, 'Medium': 2, 'High': 3}
    
    for record in normalized_data:
        eval_weight = evaluation_weights.get(record['evaluation'], 2)
        score = (record['teaching_hours'] * 1.0) + (record['lab_hours'] * 1.5) + eval_weight
        record['workload_score'] = round(score, 2)
    
    return normalized_data

def detect_imbalances(processed_data):
    """Detect workload imbalances by department"""
    # Group by faculty and department
    faculty_totals = {}
    
    for record in processed_data:
        key = f"{record['faculty']}_{record['department']}"
        if key not in faculty_totals:
            faculty_totals[key] = {
                'faculty': record['faculty'],
                'department': record['department'],
                'data_type': record['data_type'],
                'total_workload': 0,
                'records': []
            }
        faculty_totals[key]['total_workload'] += record['workload_score']
        faculty_totals[key]['records'].append(record)
    
    # Calculate department averages
    dept_averages = {}
    for faculty_data in faculty_totals.values():
        dept = faculty_data['department']
        if dept not in dept_averages:
            dept_averages[dept] = {'total': 0, 'count': 0}
        dept_averages[dept]['total'] += faculty_data['total_workload']
        dept_averages[dept]['count'] += 1
    
    for dept in dept_averages:
        dept_averages[dept]['average'] = dept_averages[dept]['total'] / dept_averages[dept]['count']
    
    # Assign status to each record
    for record in processed_data:
        faculty_key = f"{record['faculty']}_{record['department']}"
        faculty_total = faculty_totals[faculty_key]['total_workload']
        dept_avg = dept_averages[record['department']]['average']
        ratio = faculty_total / dept_avg if dept_avg > 0 else 1
        
        if ratio > 1.2:
            record['status'] = 'Overloaded'
        elif ratio < 0.8:
            record['status'] = 'Underutilized'
        else:
            record['status'] = 'Balanced'
        
        record['faculty_total_workload'] = round(faculty_total, 2)
        record['dept_average'] = round(dept_avg, 2)
    
    return processed_data