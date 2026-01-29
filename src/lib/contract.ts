import { c } from './init-ts-rest';
import { authContract } from '@/app/api/[[...ts-rest]]/auth';
import { todosContract } from '@/app/api/[[...ts-rest]]/todos';
import { usersContract } from '@/app/api/[[...ts-rest]]/users';
import { helloContract } from '@/app/api/[[...ts-rest]]/hello';

export const contract = c.router({
  auth: authContract,
  todos: todosContract,
  users: usersContract,
  hello: helloContract,
});
