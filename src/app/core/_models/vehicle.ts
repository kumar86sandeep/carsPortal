/**
 * A model for an individual corporate employee
 */
export class Vehicle {
    
    // VEHICLE CHASSIS
    model_body: string;
    model_seats: number;
    model_length_mm: number;
    model_width_mm: number;
    model_height_mm: number;
    model_wheelbase_mm: number;
    model_weight_kg: number;

    // VEHICLE ENGINE
   // ​model_engine_fuel: string;
    model_engine_cc: number;
    ​model_engine_power_ps: number;
    model_engine_power_rpm: number;
    ​model_engine_torque_nm: number;
    model_engine_torque_rpm: number;
    model_engine_compression: string;
    model_engine_boost_type: string;
    model_engine_intercooler_presence: string;
    ​model_engine_type: string;
    ​model_engine_cyl: number;
    ​model_engine_valves_per_cyl: number;
    ​model_engine_bore_mm: number;
    ​model_engine_stroke_mm: number;

    // GEARBOX AND HANDLING
    model_transmission_type: string;
    ​model_drive: string;
    ​model_no_of_speed: number;
    ​model_turning_circle: number;

    //SUSPENSION AND BRAKES
    model_front_suspension: string;
    model_back_suspension: string;
    model_front_brakes: string;
    model_rear_brakes: string;

    //OPERATING CHARACTERISTICS
    model_top_speed_kph: number;
    ​model_0_to_100_kph: number;
    ​model_lkm_city: number;
    ​model_lkm_hwy: number;
    ​model_lkm_mixed: number;
    ​model_fuel_cap_l: number;
    ​model_cruising_range : number;
    ​model_fuel : number;
    ​model_emission_standards  : string;
    
    
    constructor(object) {
       console.log('object', object);
               
       

        // VEHICLE CHASSIS   
        this.model_body = object.model_body;    
        this.model_seats = object.model_seats;    
        this.model_length_mm = object.model_length_mm;    
        this.model_width_mm = object.model_width_mm;    
        this.model_height_mm = object.model_height_mm;    
        this.model_wheelbase_mm = object.model_wheelbase_mm;    
        this.model_weight_kg = object.model_weight_kg;  
        
        // VEHICLE ENGINE
        //this.​model_engine_fuel = object.​model_engine_fuel;
        this.model_engine_cc = object.model_engine_cc;
        this.​model_engine_power_ps = object.​model_engine_power_ps;
        this.model_engine_power_rpm = object.model_engine_power_rpm;
        this.​model_engine_torque_nm = object.​model_engine_torque_nm;
        this.model_engine_torque_rpm = object.model_engine_torque_rpm;
        this.model_engine_compression = object.model_engine_compression;
        this.model_engine_boost_type = object.model_engine_boost_type;
        this.model_engine_intercooler_presence = object.model_engine_intercooler_presence;
        this.​model_engine_type = object.​model_engine_type;
        this.​model_engine_cyl = object.​model_engine_cyl;
        this.​model_engine_valves_per_cyl = object.​model_engine_valves_per_cyl;
        this.​model_engine_bore_mm = object.​model_engine_bore_mm;
        this.​model_engine_stroke_mm = object.​model_engine_stroke_mm;

        // GEARBOX AND HANDLING
        this.model_transmission_type = object.model_transmission_type;
        this.​model_drive = object.​model_drive;
        this.​model_no_of_speed = object.​model_no_of_speed;
        this.​model_turning_circle = object.​model_turning_circle;

        //SUSPENSION AND BRAKES
        this.model_front_suspension = object.model_front_suspension;
        this.model_back_suspension = object.model_back_suspension;
        this.model_front_brakes = object.model_front_brakes;
        this.model_rear_brakes = object.model_rear_brakes;

        //OPERATING CHARACTERISTICS
        this.model_top_speed_kph = object.model_top_speed_kph;
        this.​model_0_to_100_kph = object.​model_0_to_100_kph;
        this.​model_lkm_city = object.​model_lkm_city;
        this.​model_lkm_hwy = object.​model_lkm_hwy;
        this.​model_lkm_mixed = object.​model_lkm_mixed;
        this.​model_fuel_cap_l = object.​model_fuel_cap_l;
        this.​model_cruising_range = object.​model_cruising_range;
        this.​model_fuel = object.​model_fuel;
        this.​model_emission_standards = object.​model_emission_standards;
       
        
    }
}