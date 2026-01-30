// Session Management with Auto-Timeout for HIPAA Compliance
// Automatically logs out users after inactivity

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_DURATION = 2 * 60 * 1000; // Show warning 2 minutes before timeout

export class SessionManager {
    constructor(onTimeout, onWarning) {
        this.onTimeout = onTimeout; // Callback when session expires
        this.onWarning = onWarning; // Callback for timeout warning
        this.timeoutId = null;
        this.warningId = null;
        this.lastActivity = Date.now();

        this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        this.resetTimer = this.resetTimer.bind(this);
    }

    start() {
        // Add activity listeners
        this.events.forEach(event => {
            document.addEventListener(event, this.resetTimer, true);
        });

        this.resetTimer();
        console.log('[SESSION] Session manager started');
    }

    stop() {
        // Remove activity listeners
        this.events.forEach(event => {
            document.removeEventListener(event, this.resetTimer, true);
        });

        this.clearTimers();
        console.log('[SESSION] Session manager stopped');
    }

    resetTimer() {
        this.lastActivity = Date.now();
        this.clearTimers();

        // Set warning timer
        this.warningId = setTimeout(() => {
            if (this.onWarning) {
                this.onWarning();
            }
        }, TIMEOUT_DURATION - WARNING_DURATION);

        // Set timeout timer
        this.timeoutId = setTimeout(() => {
            console.log('[SESSION] Session expired due to inactivity');
            if (this.onTimeout) {
                this.onTimeout();
            }
        }, TIMEOUT_DURATION);
    }

    clearTimers() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.warningId) {
            clearTimeout(this.warningId);
            this.warningId = null;
        }
    }

    getRemainingTime() {
        const elapsed = Date.now() - this.lastActivity;
        return Math.max(0, TIMEOUT_DURATION - elapsed);
    }

    getRemainingMinutes() {
        return Math.ceil(this.getRemainingTime() / 60000);
    }
}

export const sessionConfig = {
    TIMEOUT_DURATION,
    WARNING_DURATION,
    TIMEOUT_MINUTES: TIMEOUT_DURATION / 60000,
    WARNING_MINUTES: WARNING_DURATION / 60000
};
