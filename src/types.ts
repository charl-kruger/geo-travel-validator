// Define the structure of a login event
export interface LoginEvent {
    timestamp: Date;
    latitude: number;
    longitude: number;
}

// Define the result structure
export interface TravelPossibility {
    possible: boolean;
    requiredSpeedKmh: number;
    maxAllowedSpeedKmh: number;
    distanceKm: number;
    timeDifferenceMinutes: number;
}
