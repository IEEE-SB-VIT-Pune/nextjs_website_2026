export interface Question {
  id: number;
  text: string;
  type: "mcq";
  options: string[];
  answer: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: `Predict the Output:
\`\`\`cpp
#include<iostream>
using namespace std;

int main() {
    int x = 4;
    for(int i = 0; i < 3; i++) {
        x = x + i;
    }
    cout << x;
}
\`\`\``,
    type: "mcq",
    options: ["7", "6", "5", "4"],
    answer: "7",
  },
  {
    id: 2,
    text: `Debug the Code: This program should calculate the sum of array elements but produces wrong result. Identify the mistake:
\`\`\`cpp
int arr[4] = {2,4,6,8};
int sum = 0;

for(int i = 0; i < 4; i++) {
    sum = arr[i];
}
cout << sum;
\`\`\``,
    type: "mcq",
    options: [
      "sum += arr[i];",
      "sum = sum + i;",
      "sum = arr[i] + 1;",
      "sum = arr[0];",
    ],
    answer: "sum += arr[i];",
  },
  {
    id: 3,
    text: `Fill in the blank to correctly determine whether a number is prime:
\`\`\`cpp
bool prime = true;

for(int i = 2; i < n; i++) {
    if(n % i == 0) {
        prime = ______;
        break;
    }
}
\`\`\``,
    type: "mcq",
    options: ["true", "false", "0", "break"],
    answer: "false",
  },
  {
    id: 4,
    text: `Predict the Output:
\`\`\`cpp
int a = 5;
int b = 10;

swap(a, b);

cout << a << " " << b;
\`\`\``,
    type: "mcq",
    options: ["5 10", "10 5", "Error", "0 0"],
    answer: "10 5",
  },
  {
    id: 5,
    text: `Loop Analysis: How many times will the following loop execute?
\`\`\`cpp
for(int i = 1; i <= 100; i *= 2) {
    cout << i << " ";
}
\`\`\``,
    type: "mcq",
    options: ["5", "6", "7", "8"],
    answer: "7",
  },
  {
    id: 6,
    text: `Predict the Output (Tricky):
\`\`\`cpp
int x = 5;

cout << x++ + ++x;
\`\`\``,
    type: "mcq",
    options: ["10", "11", "12", "Undefined Behavior"],
    answer: "Undefined Behavior",
  },
  {
    id: 7,
    text: `Debug the Code: This code attempts to find the maximum element. Why can it fail for certain inputs?
\`\`\`cpp
int arr[5] = {2,8,1,9,4};
int mx = 0;

for(int i = 0; i < 5; i++) {
    if(arr[i] > mx)
        mx = arr[i];
}
cout << mx;
\`\`\``,
    type: "mcq",
    options: [
      "mx should be initialized as arr[0]",
      "Loop condition is incorrect",
      "Array size is incorrect",
      "Comparison operator is incorrect",
    ],
    answer: "mx should be initialized as arr[0]",
  },
  {
    id: 8,
    text: `Fill in the blank to reverse an array:
\`\`\`cpp
for(int i = 0; i < n/2; i++) {
    ______(arr[i], arr[n-i-1]);
}
\`\`\``,
    type: "mcq",
    options: ["change", "swap", "reverse", "flip"],
    answer: "swap",
  },
  {
    id: 9,
    text: `Predict the Output:
\`\`\`cpp
int arr[] = {1,3,5,7};

cout << sizeof(arr)/sizeof(arr[0]);
\`\`\``,
    type: "mcq",
    options: ["3", "4", "5", "Error"],
    answer: "4",
  },
  {
    id: 10,
    text: `What is the time complexity of this code?
\`\`\`cpp
for(int i = 0; i < n; i++) {
    for(int j = 0; j < n; j++) {
        cout << i + j;
    }
}
\`\`\``,
    type: "mcq",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: "O(n²)",
  },
  {
    id: 11,
    text: `Predict the Output:
\`\`\`cpp
#include <algorithm>
#include <string>
using namespace std;

string s = "code";

reverse(s.begin(), s.end());

cout << s;
\`\`\``,
    type: "mcq",
    options: ["code", "edoc", "error", "edoC"],
    answer: "edoc",
  },
  {
    id: 12,
    text: `Predict the Output:
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int b = 5;
    cout << a / b * 2;
}
\`\`\``,
    type: "mcq",
    options: ["1", "4", "5", "10"],
    answer: "4",
  },
  {
    id: 13,
    text: `Predict the Output:
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int x = 5;
    cout << x++ << " " << ++x;
}
\`\`\``,
    type: "mcq",
    options: ["5 6", "5 7", "6 7", "6 6"],
    answer: "5 7",
  },
  {
    id: 14,
    text: `What is the time complexity?
\`\`\`cpp
for(int i = 1; i < n; i *= 2) {
    cout << i;
}
\`\`\``,
    type: "mcq",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    answer: "O(log n)",
  },
  {
    id: 15,
    text: `Predict the Output:
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int arr[3] = {10,20,30};
    cout << arr[1];
}
\`\`\``,
    type: "mcq",
    options: ["10", "20", "30", "Error"],
    answer: "20",
  },
  {
    id: 16,
    text: `Predict the Output:
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int x = 3;
    if(x = 5)
        cout << "Hello";
    else
        cout << "World";
}
\`\`\``,
    type: "mcq",
    options: ["Hello", "World", "Error", "Nothing"],
    answer: "Hello",
  },
];

export function getShuffledQuestions(count: number = 10): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default questions;
