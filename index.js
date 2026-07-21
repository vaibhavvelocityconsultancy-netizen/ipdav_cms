// move zeros

function moveZeros(arr) {
  //  while looop
  let slow = 0;

  for (let fast = 0; fast < arr.length; fast++) {
    if (arr[fast] !== 0) {
      [arr[slow], arr[fast]] = [arr[fast], arr[slow]];
      slow++;
    }
  }

  return arr;
}

console.log(moveZeros([0, 1, 0, 3, 12]));

// remove dupplicates
function removeDuplicates(arr) {
  let slow = 0;

  for (let fast = 0; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast];
    }
  }
  return arr.slice(0, slow + 1);
}

console.log(removeDuplicates([1, 2, 2, 3, 4, 4, 5]));

// move

function removeDuplicate(arr) {
  if (arr.length === 0) return 0;

  let slow = 1;

  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[fast - 1]) {
      arr[slow] = arr[fast];
      slow++;
    }
  }

  return slow;
}

console.log(removeDuplicate([1,1,2,2,3,4,4]));


// function moveNumbers(arr) {
//   let slow = 0;

//   for (let fast = 0; fast < arr.length; fast++) {
//     if (arr[fast] % 2 === 0) {
//       [arr[slow], arr[fast]] = [arr[fast], arr[slow]];
//       slow++;
//     }
//   }

//   return arr;
// }
// console.log(moveNumbers([1, 4, 5, 9, 8, 2]));


// remove all occuse of target
function removeTarget(arr, target) {
    let slow = 0;

    for (let fast = 0; fast < arr.length; fast++) {
        if (arr[fast] !== target) {
            arr[slow] = arr[fast];
            slow++;
        }
        
    }
    return arr;
}

console.log(removeTarget([1,2,2,2,3,3,3,4,5,9], 2));
