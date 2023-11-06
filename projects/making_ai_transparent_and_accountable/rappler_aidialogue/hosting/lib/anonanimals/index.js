import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";

import { db } from "../firebase";

import { toSentenceCase } from "../utils";

import adjectives from "./adjectives";
import animals from "./animals";

const animalSize = animals.length;
const adjectiveSize = adjectives.length;

const anonymous = () => {
  let recursionCount = 0;
  /**
   * @param {options} options
   * @returns {info}
   */
  const generate = async (options = {}) => {
    const { prefix } = options;
    const adjective = adjectives[Math.floor(Math.random() * adjectiveSize)];
    const animal = animals[Math.floor(Math.random() * animalSize)];
    const name = `${toSentenceCase(adjective)} ${toSentenceCase(animal)}`;
    // console.log("generated name", name);
    // check if name already exists
    // if there is generate a new name/animal
    const q = query(collection(db, "users"), where("name", "==", name));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;
    // console.log('anonymous name count', count);
    if (count > 0) {
      // console.log('recursing', recursionCount);
      recursionCount++;
      if (recursionCount === 5) {
        console.log("max recursion reached");
        return { name: null, animal: null };
      } else {
        return generate();
      }
    }
    return {
      name: prefix ? `${prefix} ${name}` : name,
      animal,
    };
  };

  return {
    generate,
  };
};

export default anonymous();
