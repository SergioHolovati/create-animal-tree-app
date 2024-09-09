"use client"; 

import { useState } from 'react';
import './styles.css';  

type Hierarchy = {
  [key: string]: Hierarchy | string[];
};

type JsonObject = { [key: string]: any };

export default function Home() {
  const [hierarchy, setHierarchy] = useState<Hierarchy>({
    Animais: {}
  });
  const [newCategory, setNewCategory] = useState('');
  const [newAnimal, setNewAnimal] = useState('');

  const handleAddCategory = (path: string) => {
    if (!newCategory) return;

    const updatedHierarchy = { ...hierarchy };
    const target = path.split('.').reduce((acc: any, cur: string) => acc[cur], updatedHierarchy);
    target[newCategory] = {};
    setHierarchy(updatedHierarchy);
    setNewCategory('');
  };

  const handleAddAnimal = (path: string) => {
    if (!newAnimal) return;

    const updatedHierarchy = { ...hierarchy };
    const target = path.split('.').reduce((acc: any, cur: string) => acc[cur], updatedHierarchy);
    if (Array.isArray(target)) {
      target.push(newAnimal);
    } else if (typeof target === 'object') {
      target[newAnimal] = [];
    }
    setHierarchy(updatedHierarchy);
    setNewAnimal('');
  };

  const handleRemoveCategory = (path: string) => {
    const updatedHierarchy = { ...hierarchy };
    const pathParts = path.split('.');
    const lastKey = pathParts.pop();
    const target = pathParts.reduce((acc: any, cur: string) => acc[cur], updatedHierarchy);
    if (lastKey && typeof target === 'object') {
      delete target[lastKey];
      setHierarchy(updatedHierarchy);
    }
  };

  const handleRemoveAnimal = (path: string, animal: string) => {
    const updatedHierarchy = { ...hierarchy };
    const target = path.split('.').reduce((acc: any, cur: string) => acc[cur], updatedHierarchy);
    if (Array.isArray(target)) {
      const index = target.indexOf(animal);
      if (index !== -1) {
        target.splice(index, 1);
        setHierarchy(updatedHierarchy);
      }
    }
  };

  function transformJson(obj: JsonObject): JsonObject {
    function transform(value: any): any {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const result: JsonObject = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            const transformed = transform(value[key]);
            if (Object.keys(transformed).length === 0 && Array.isArray(transformed)) {
              result[key] = transformed;
            } else if (Array.isArray(transformed) && transformed.length === 0) {
              result[key] = transformed;
            } else if (typeof transformed === 'object') {
              result[key] = transformed;
            } else {
              result[key] = transformed;
            }
          }
        }
        return result;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          return value;
        }
        return value.map(item => transform(item));
      } else {
        return value;
      }
    }
  
    function convertEmptyObjectsToArray(obj: JsonObject): void {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'object' && !Array.isArray(value)) {
            const keys = Object.keys(value);
            if (keys.length > 0) {
             
              const allEmpty = keys.every(k => Array.isArray(value[k]) && value[k].length === 0);
              if (allEmpty) {
                obj[key] = keys;
              } else {
                convertEmptyObjectsToArray(value);
              }
            }
          } else if (Array.isArray(value)) {
            const nonEmptyValues = value.filter(item => item !== undefined);
            if (nonEmptyValues.length > 0) {
              obj[key] = nonEmptyValues;
            }
          }
        }
      }
    }
  
    
    const transformedJson = transform(obj);
    convertEmptyObjectsToArray(transformedJson);
    return transformedJson;
  }
 
  const handleDownloadJSON = () => {
    const transformedHierarchy = transformJson(hierarchy);
    const jsonStr = JSON.stringify(transformedHierarchy, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hierarchy.json';
    link.click();
  };

  return (
    <div>
      <h1>Hierarquia de Animais</h1>
      <HierarchyDisplay
        hierarchy={hierarchy}
        path=""
        setNewCategory={setNewCategory}
        setNewAnimal={setNewAnimal}
        handleAddCategory={handleAddCategory}
        handleAddAnimal={handleAddAnimal}
        handleRemoveCategory={handleRemoveCategory}
        handleRemoveAnimal={handleRemoveAnimal}
      />
      <button className="download-btn" onClick={handleDownloadJSON}>Download JSON</button>
    </div>
  );
}

interface HierarchyDisplayProps {
  hierarchy: Hierarchy;
  path: string;
  setNewCategory: (value: string) => void;
  setNewAnimal: (value: string) => void;
  handleAddCategory: (path: string) => void;
  handleAddAnimal: (path: string) => void;
  handleRemoveCategory: (path: string) => void;
  handleRemoveAnimal: (path: string, animal: string) => void;
}

const HierarchyDisplay: React.FC<HierarchyDisplayProps> = ({
  hierarchy,
  path,
  setNewCategory,
  setNewAnimal,
  handleAddCategory,
  handleAddAnimal,
  handleRemoveCategory,
  handleRemoveAnimal
}) => {
  return (
    <ul>
      {Object.keys(hierarchy).map((key) => (
        <li key={key}>
          <strong>{key}</strong>
          {key !== 'Animais' && (
            <button onClick={() => handleRemoveCategory(path ? `${path}.${key}` : key)}>
              Remover Categoria
            </button>
          )}

          {typeof hierarchy[key] === 'object' && !Array.isArray(hierarchy[key]) ? (
            <>
              <HierarchyDisplay
                hierarchy={hierarchy[key] as Hierarchy}
                path={path ? `${path}.${key}` : key}
                setNewCategory={setNewCategory}
                setNewAnimal={setNewAnimal}
                handleAddCategory={handleAddCategory}
                handleAddAnimal={handleAddAnimal}
                handleRemoveCategory={handleRemoveCategory}
                handleRemoveAnimal={handleRemoveAnimal}
              />
              <div>
                <input
                  type="text"
                  placeholder="Nova Categoria"
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button className="add-btn" onClick={() => handleAddCategory(path ? `${path}.${key}` : key)}>
                  Adicionar Categoria
                </button>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Novo Animal"
                  onChange={(e) => setNewAnimal(e.target.value)}
                />
                <button className="add-btn" onClick={() => handleAddAnimal(path ? `${path}.${key}` : key)}>
                  Adicionar Animal
                </button>
              </div>
            </>
          ) : (
            <ul>
              {(hierarchy[key] as string[]).map((animal) => (
                <li key={animal}>
                  {animal}
                  <button onClick={() => handleRemoveAnimal(path ? `${path}.${key}` : key, animal)}>
                    Remover Animal
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};
