import { IService } from "../interfaces/services/iService";

export class Container {
    private static instance: Container
    private services: Map<string, any> = new Map();
    public initialized : boolean;

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    register<T, U extends T = T>(name: string, item: U): void {
        this.services.set(name, item);
    }

    resolve<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }

        return service; 
    }

    getServices(): Array<IService> {
        return  Array.from(this.services.values()) as Array<IService>;
    }

    clear(): void {
        this.services.clear();
    }
}

export const container = Container.getInstance();