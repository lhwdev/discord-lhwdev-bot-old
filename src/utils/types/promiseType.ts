// https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise
export type Await<T> = T extends PromiseLike<infer U> ? U : T;
