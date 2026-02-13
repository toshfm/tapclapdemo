
interface IRegistration {
    initial: () => any;
    instance?: any;
    scope: 'Singleton' | 'Transient'
}

export class Container {
    private static instance: Container
    private services: Map<string, IRegistration> = new Map();
    public initialized: boolean;

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    addSingleton<T, U extends T = T>(name: string, item: () => U): void {
        this.services.set(name, { initial: item, scope: 'Singleton' });
    }

    addTransient<T, U extends T = T>(name: string, item: () => U): void {
        this.services.set(name, { initial: item, scope: 'Transient' });
    }

    resolve<T>(name: string): T {
        let service = this.services.get(name);
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }

        if (service.scope == 'Singleton') {
            if (!service.instance) service.instance = service.initial();
            return service.instance;
        }

        return service.initial();
    }

    clear(): void {
        this.services.clear();
    }
}

export const DI = Container.getInstance();