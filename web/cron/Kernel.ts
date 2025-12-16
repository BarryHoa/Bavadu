/**
 * Cron Scheduler Kernel
 * Similar to Laravel's Kernel.php - defines scheduled tasks
 */

import { SYSTEM_CONFIG } from "@base/server/config";
import { getTasks, ScheduledTask as NodeCronTask, schedule } from "node-cron";

export interface ScheduledTask {
  schedule: string;
  task: () => Promise<void> | void;
  name: string;
  enabled?: boolean;
}

export class Kernel {
  private tasks: Map<string, ScheduledTask> = new Map();

  /**
   * Schedule a task using custom cron expression
   * @param expression - Cron expression
   * @param name - Task name for logging (must be unique)
   * @param task - Task function to execute
   * @throws Error if task name already exists
   */
  protected makeACronTask(
    expression: string,
    name: string,
    task: () => Promise<void> | void,
  ): void {
    // Check if task name already exists
    if (this.tasks.has(name)) {
      throw new Error(
        `Task with name "${name}" already exists. Each task must have a unique name.`,
      );
    }

    this.tasks.set(name, {
      schedule: expression,
      task,
      name,
      enabled: true,
    });
  }

  /**
   * Schedule a task to run every N seconds
   * Note: node-cron uses 5-field format, so this uses every minute with custom logic
   * For true second-level scheduling, consider using setInterval instead
   * @param seconds - Number of seconds (1-59)
   * @param name - Task name for logging
   * @param task - Task function to execute
   */
  protected everySeconds(
    seconds: number,
    name: string,
    task: () => Promise<void> | void,
  ): void {
    if (seconds < 1 || seconds > 59) {
      throw new Error("Seconds must be between 1 and 59");
    }
    // Use every minute and let the task handle second-level logic
    // Or use a workaround with multiple tasks
    this.makeACronTask(
      `* * * * *`, // Every minute
      name,
      async () => {
        // Run task every N seconds within the minute
        const interval = setInterval(async () => {
          await task();
        }, seconds * 1000);

        // Clear after 60 seconds
        setTimeout(() => clearInterval(interval), 60000);
      },
    );
  }

  /**
   * Schedule a task to run every N minutes
   * @param minutes - Number of minutes
   * @param name - Task name for logging
   * @param task - Task function to execute
   */
  protected everyMinutes(
    minutes: number,
    name: string,
    task: () => Promise<void> | void,
  ): void {
    this.makeACronTask(`*/${minutes} * * * *`, name, task);
  }

  /**
   * Schedule a task to run hourly
   * @param name - Task name for logging
   * @param task - Task function to execute
   * @param minute - Optional minute of the hour (0-59, default: 0)
   */
  protected hourly(
    name: string,
    task: () => Promise<void> | void,
    minute: number = 0,
  ): void {
    this.makeACronTask(`${minute} * * * *`, name, task);
  }

  /**
   * Schedule a task to run every N hours
   * @param hours - Number of hours
   * @param name - Task name for logging
   * @param task - Task function to execute
   * @param minute - Optional minute of the hour (0-59, default: 0)
   */
  protected everyHours(
    hours: number,
    name: string,
    task: () => Promise<void> | void,
    minute: number = 0,
  ): void {
    this.makeACronTask(`${minute} */${hours} * * *`, name, task);
  }

  /**
   * Schedule a task to run at a specific time daily
   * @param name - Task name for logging
   * @param time - Time in HH:mm format (e.g., "03:00", "14:30")
   * @param task - Task function to execute
   */
  protected dailyAt(
    name: string,
    time: string,
    task: () => Promise<void> | void,
  ): void {
    const [hours, minutes] = time.split(":").map(Number);
    const cronExpression = `${minutes} ${hours} * * *`;

    this.makeACronTask(cronExpression, name, task);
  }

  /**
   * Schedule a task to run daily
   * @param name - Task name for logging
   * @param task - Task function to execute
   * @param time - Optional time in HH:mm format (default: "00:00")
   */
  protected daily(
    name: string,
    task: () => Promise<void> | void,
    time: string = "00:00",
  ): void {
    this.dailyAt(name, time, task);
  }

  /**
   * Schedule a task to run monthly
   * @param name - Task name for logging
   * @param task - Task function to execute
   * @param day - Optional day of the month (1-31, default: 1)
   * @param time - Optional time in HH:mm format (default: "00:00")
   */
  protected monthly(
    name: string,
    task: () => Promise<void> | void,
    day: number = 1,
    time: string = "00:00",
  ): void {
    const [hours, minutes] = time.split(":").map(Number);
    const cronExpression = `${minutes} ${hours} ${day} * *`;

    this.makeACronTask(cronExpression, name, task);
  }

  /**
   * Schedule a task to run yearly
   * @param name - Task name for logging
   * @param task - Task function to execute
   * @param month - Optional month (1-12, default: 1)
   * @param day - Optional day of the month (1-31, default: 1)
   * @param time - Optional time in HH:mm format (default: "00:00")
   */
  protected yearly(
    name: string,
    task: () => Promise<void> | void,
    month: number = 1,
    day: number = 1,
    time: string = "00:00",
  ): void {
    const [hours, minutes] = time.split(":").map(Number);
    const cronExpression = `${minutes} ${hours} ${day} ${month} *`;

    this.makeACronTask(cronExpression, name, task);
  }

  /**
   * Get timezone for scheduled tasks
   * @returns Timezone string (e.g., "Asia/Ho_Chi_Minh")
   */
  protected getTimezone(): string {
    return SYSTEM_CONFIG.timezone;
  }

  /**
   * Define the application's task schedule
   * Similar to Laravel's schedule() method
   * Override this method in child class to define tasks
   */
  protected schedule(): void {
    // Override this method in child class (e.g., ScheduledTask)
  }

  /**
   * Start the scheduler
   * Call this after defining all tasks in schedule()
   */
  public start(): void {
    // Define schedule
    this.schedule();

    // Register and start all tasks
    this.tasks.forEach((scheduledTask, taskName) => {
      if (scheduledTask.enabled !== false) {
        schedule(
          scheduledTask.schedule,
          async () => {
            const startTime = Date.now();

            console.log(`[Cron] Running task: ${taskName}`);

            try {
              await scheduledTask.task();
              const duration = Date.now() - startTime;

              console.log(
                `[Cron] Task "${taskName}" completed in ${duration}ms`,
              );
            } catch (error) {
              console.error(`[Cron] Task "${taskName}" failed:`, error);
            }
          },
          {
            timezone: this.getTimezone(),
            name: taskName,
          },
        );

        console.log(
          `[Cron] Scheduled task: ${taskName} - ${scheduledTask.schedule}`,
        );
      }
    });

    console.log(`[Cron] Scheduler started with ${this.tasks.size} task(s)`);
  }

  /**
   * Stop the scheduler
   */
  public stop(): void {
    const tasks = getTasks();

    tasks.forEach((task: NodeCronTask) => {
      task.stop();
    });
    console.log("[Cron] Scheduler stopped");
  }

  /**
   * Restart the scheduler
   * Stops all tasks and starts them again
   */
  public restart(): void {
    console.log("[Cron] Restarting scheduler...");
    this.stop();
    this.tasks.clear(); // Clear tasks to allow schedule() to redefine them
    this.start();
    console.log("[Cron] Scheduler restarted");
  }

  /**
   * Get list of scheduled tasks
   */
  public getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by name
   * @param name - Task name
   * @returns Task if found, undefined otherwise
   */
  public getTask(name: string): ScheduledTask | undefined {
    return this.tasks.get(name);
  }

  /**
   * Check if task exists by name
   * @param name - Task name
   * @returns true if task exists, false otherwise
   */
  public hasTask(name: string): boolean {
    return this.tasks.has(name);
  }
}
