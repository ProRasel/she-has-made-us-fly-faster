// Fly Animations Controller v 0.0.1
class AnimationController {
    constructor() {
        // Reference key elements in the scene
        this.elements = {
            car: document.getElementById('car'),
            girl: document.getElementById('girl'),
            airplane: document.getElementById('airplane'),
            kaderImg: document.getElementById('kader_img'),
            scene: document.getElementById('scene'),
            background: document.body, // Background is controlled via the body
            clouds: document.querySelectorAll('.cloud') // Get all cloud elements
        };

        // Set initial positions for car, girl, and airplane
        this.positions = {
            car: { x: -150, stop: window.innerWidth - 550 }, // Car stops 550px before the screen edge
            girl: { x: window.innerWidth - 400 }, // Girl appears 400px before the screen edge
            airplane: { x: window.innerWidth - 430, y: window.innerHeight - 500 } // Airplane starts at a specific height and position
        };

        // Initialize all the elements and animations
        this.initializeElements();
        this.createParticles(); // Add particle effects for car and airplane
        this.initializeAnimation(); // Set up the main animation sequence
    }

    // Setup initial visibility and positioning of elements
    initializeElements() {
        gsap.set(this.elements.girl, { display: 'none', x: this.positions.car.stop - 40 });
        gsap.set(this.elements.kaderImg, { opacity: 0, scale: 0.8 });
        gsap.set(this.elements.scene, { x: 0 });
        gsap.set(this.elements.airplane, { x: this.positions.airplane.x, y: this.positions.airplane.y });

        // Animate clouds with a floating effect
        this.elements.clouds.forEach(cloud => {
            gsap.to(cloud, {
                y: "+=20",
                duration: gsap.utils.random(10, 20),
                repeat: -1,
                yoyo: true, // Clouds move up and down
                ease: "power1.inOut"
            });
        });
    }

    // Create exhaust particles for the car and airplane
    createParticles() {
        this.carParticles = new Array(10).fill().map(() => this.createParticle(this.elements.car, 'car'));
        this.airplaneParticles = new Array(20).fill().map(() => this.createParticle(this.elements.airplane, 'airplane'));
    }

    // Create a particle element, apply initial properties based on vehicle type
    createParticle(parent, type) {
        const particle = document.createElement('div');
        particle.className = `particle ${type}-particle`;
        parent.appendChild(particle);
        
        // Set particle initial position, opacity, and scale
        gsap.set(particle, {
            x: type === 'car' ? -10 : -30,
            y: type === 'car' ? gsap.utils.random(0, 10) : gsap.utils.random(-10, 10),
            opacity: gsap.utils.random(0.3, 0.7),
            scale: gsap.utils.random(0.5, 1)
        });

        return particle;
    }

    // Animate particles movement and fade out, repeating the process indefinitely
    animateParticles(particles, duration) {
        particles.forEach(particle => {
            gsap.to(particle, {
                x: `-=${gsap.utils.random(50, 100)}`, // Random movement to the left
                y: gsap.utils.random(-20, 20), // Random vertical movement
                opacity: 0, // Fade out effect
                scale: 0, // Shrink effect
                duration: gsap.utils.random(duration * 0.5, duration), // Random duration for variety
                ease: "power1.out", // Smooth out movement
                repeat: -1 // Repeat infinitely
            });
        });
    }

    // Main animation sequence setup
    initializeAnimation() {
        const mainTimeline = gsap.timeline(); // Create a GSAP timeline

        // Add each phase of the animation to the timeline
        mainTimeline
            .add(this.carMovementPhase())       // Car moves in first
            .add(this.girlWalkingPhase())       // Girl walks to the airplane
            .add(this.airplaneTakeoffPhase())   // Airplane takes off
            .add(this.flyingSequencePhase())    // Airplane flies for a while
            .add(this.airplaneExitPhase())      // Airplane exits the screen
            .add(this.carFinalMovementPhase())  // Car moves again
            .add(this.kaderImagePhase())        // Show Kader image
            .add(this.finalCleanupPhase());     // Reset background and finalize
    }

    // Phase 1: Move car across the screen
    carMovementPhase() {
        const tl = gsap.timeline();
        tl.to(this.elements.car, {
            duration: 5, // Move for 5 seconds
            x: this.positions.car.stop, // Stop at predefined position
            ease: "power2.inOut", // Smooth movement in and out
            onUpdate: () => this.updateBackground(gsap.getProperty(this.elements.car, "x"), 'car'),
            onStart: () => this.animateParticles(this.carParticles, 1) // Start car exhaust particles
        });
        return tl;
    }

    // Phase 2: Girl walks from the car to the airplane
    girlWalkingPhase() {
        const tl = gsap.timeline();
        tl.to(this.elements.girl, {
            duration: 0.3,
            display: 'block', // Show the girl
            opacity: 1,
            ease: "power1.in"
        }).to(this.elements.girl, {
            duration: 4.7,
            x: this.positions.airplane.x + 180, // Move girl towards airplane
            ease: "steps(10)", // Simulate walking with steps
            onStart: () => this.stopBackgroundMovement() // Stop the background from moving
        });
        return tl;
    }

    // Phase 3: Airplane takeoff animation
    airplaneTakeoffPhase() {
        const tl = gsap.timeline();
        tl.to(this.elements.girl, {
            duration: 1,
            y: "-=45", // Lift the girl into the airplane
            ease: "power1.inOut"
        }).to(this.elements.airplane, {
            duration: 1,
            y: "-=40", // Airplane starts to ascend
            ease: "power1.in",
            onUpdate: () => this.updateBackground(gsap.getProperty(this.elements.airplane, "x"), 'airplaneTakeoff'),
            onStart: () => this.animateParticles(this.airplaneParticles, 0.5) // Airplane exhaust particles
        }, "-=0.5");
        return tl;
    }

    // Phase 4: Airplane flight sequence
    flyingSequencePhase() {
        const tl = gsap.timeline();
        tl.to([this.elements.airplane, this.elements.girl], {
            duration: 7, // Airplane flies for 5 seconds
            x: "+=300", // Moves to the right
            y: "-=100", // Continues ascending
            ease: "power1.inOut",
            onUpdate: () => {
                this.updateBackground(gsap.getProperty(this.elements.airplane, "x"), 'airplaneFlight');
                this.moveCamera(); // Move the camera to track the airplane
            }
        });
        return tl;
    }

    // Phase 5: Airplane exits the screen
    airplaneExitPhase() {
        const tl = gsap.timeline();
        tl.to([this.elements.airplane, this.elements.girl], {
            duration: 2,
            x: "+=800", // Airplane flies off-screen
            y: "-=400", // Continues ascending
            ease: "power2.in",
            onComplete: () => {
                gsap.set([this.elements.airplane, this.elements.girl], { display: 'none' }); // Hide them after exiting
                this.resetCamera(); // Reset camera position
            }
        }).to({}, { duration: 0.5 }); // Brief pause before next action
        return tl;
    }

    // Phase 6: Final car movement phase
    carFinalMovementPhase() {
        const tl = gsap.timeline();
        tl.to(this.elements.car, {
            duration: 2,
            x: "+=800", // Car drives away
            ease: "power2.in",
            onUpdate: () => this.updateBackgroundParallax() // Update background for parallax effect
        }).to(this.elements.background, {
            duration: 2,
            backgroundPositionX: "-=600px", // Adjust background position
            ease: "power2.inOut"
        }, "-=2");
        return tl;
    }

    // Phase 7: Show the Kader image with a fade-in and scaling effect
    kaderImagePhase() {
        const tl = gsap.timeline();
        tl.to(this.elements.kaderImg, {
            duration: 0.8,
            opacity: 1, // Fade in the image
            scale: 1, // Scale up the image
            ease: "back.out(1.7)" // Smooth scale effect
        }, "+=0.5");
        return tl;
    }

    // Phase 8: Cleanup and reset background after animations
    finalCleanupPhase() {
        const tl = gsap.timeline();
        tl.to(this.elements.kaderImg, {
            duration: 0.5,
            opacity: 3, // Fade out Kader image
            scale: 0.9, // Scale down image
            ease: "power2.in", 
            delay: 2 // Delay before reset
        }).to(this.elements.background, {
            duration: 1.5,
            backgroundPositionX: "210px", // Reset background position
            ease: "power2.inOut"
        }, "-=0.5");
        return tl;
    }

    // Update the background position depending on the phase and speed factor
    updateBackground(referencePosition, phase) {
        let speedFactor;
        switch (phase) {
            case 'car': speedFactor = 2; break;
            case 'airplaneTakeoff': speedFactor = 1; break;
            case 'airplaneFlight': speedFactor = 0.5; break;
            default: return;
        }
        gsap.to(this.elements.background, {
            backgroundPositionX: `${-referencePosition / speedFactor}px`,
            duration: 0.1,
            ease: "none"
        });
    }

    // Update background position based on car movement for parallax effect
    updateBackgroundParallax() {
        const carProgress = (gsap.getProperty(this.elements.car, "x") - this.positions.car.stop) / (window.innerWidth + 300 - this.positions.car.stop);
        gsap.to(this.elements.background, {
            backgroundPositionX: `-=${carProgress * 200}px`,
            duration: 0.1,
            ease: "none"
        });
    }

    // Move the camera to track the midpoint between the car and airplane
    moveCamera() {
        const airplaneX = gsap.getProperty(this.elements.airplane, "x");
        const carX = gsap.getProperty(this.elements.car, "x");
        const midpoint = (airplaneX + carX) / 2; // Midpoint between the two
        gsap.to(this.elements.scene, {
            x: -midpoint + window.innerWidth / 2, // Move the scene to center on the midpoint
            duration: 0.3,
            ease: "power2.out"
        });
    }

    // Reset camera to its original position
    resetCamera() {
        gsap.to(this.elements.scene, {
            x: 0, // Reset scene position
            duration: 1,
            ease: "power2.inOut"
        });
    }

    // Stop background movement
    stopBackgroundMovement() {
        gsap.killTweensOf(this.elements.background, "backgroundPositionX"); // Stop any ongoing background animations
    }
}

// Initialize the animation
new AnimationController();
