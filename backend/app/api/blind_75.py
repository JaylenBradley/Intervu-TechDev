import random
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Line(BaseModel):
    text: str
    indentLevel: int  

class Problem(BaseModel):
    title: str
    difficulty: str
    space: str
    time: str
    prompt: str             
    solution: List[Line]

# Blind‑75 problem bank
PROBLEMS: List[Problem] = [
    Problem(
        title="Two Sum",
        difficulty="Easy",
        space="O(n)",
        time="O(n)",
        prompt=(
            "Given an array of integers nums and an integer target, return indices of the "
            "two numbers such that they add up to target. Assume exactly one solution."
        ),
        solution=[
            Line(text="def twoSum(nums, target):", indentLevel=0),
            Line(text="num_map = {}", indentLevel=1),
            Line(text="for i, num in enumerate(nums):", indentLevel=1),
            Line(text="if target - num in num_map:", indentLevel=2),
            Line(text="return [num_map[target - num], i]", indentLevel=3),
            Line(text="num_map[num] = i", indentLevel=2),
        ],
    ),
    Problem(
        title="Valid Parentheses",
        difficulty="Easy",
        space="O(n)",
        time="O(n)",
        prompt=(
            "Given a string s containing only the characters '(', ')', '{', '}', '[' and ']', "
            "determine if the input string is valid. An input string is valid if: "
            "1) Open brackets are closed by the same type of brackets, and "
            "2) Open brackets are closed in the correct order."
        ),
        solution=[
            Line(text="def isValid(s):", indentLevel=0),
            Line(text="stack = []", indentLevel=1),
            Line(text="pairs = {')': '(', '}': '{', ']': '['}", indentLevel=1),
            Line(text="for ch in s:", indentLevel=1),
            Line(text="if ch in pairs.values():", indentLevel=2),
            Line(text="stack.append(ch)", indentLevel=3),
            Line(text="elif ch in pairs:", indentLevel=2),
            Line(text="if not stack or stack.pop() != pairs[ch]:", indentLevel=3),
            Line(text="return False", indentLevel=4),
            Line(text="return not stack", indentLevel=1),
        ],
    ),
    Problem(
        title="Merge Two Sorted Lists",
        difficulty="Easy",
        space="O(n)",
        time="O(n)",
        prompt=(
            "Merge two sorted linked lists and return it as a new sorted list. "
            "The list should be made by splicing together the nodes of the first two lists."
        ),
        solution=[
            Line(text="class ListNode:", indentLevel=0),
            Line(text="def __init__(self, val=0, next=None):", indentLevel=1),
            Line(text="self.val = val", indentLevel=2),
            Line(text="self.next = next", indentLevel=2),
            Line(text="def mergeTwoLists(l1, l2):", indentLevel=0),
            Line(text="dummy = tail = ListNode()", indentLevel=1),
            Line(text="while l1 and l2:", indentLevel=1),
            Line(text="if l1.val < l2.val:", indentLevel=2),
            Line(text="tail.next, l1 = l1, l1.next", indentLevel=3),
            Line(text="else:", indentLevel=2),
            Line(text="tail.next, l2 = l2, l2.next", indentLevel=3),
            Line(text="tail = tail.next", indentLevel=2),
            Line(text="tail.next = l1 or l2", indentLevel=1),
            Line(text="return dummy.next", indentLevel=1),
        ],
    ),
]

@router.get("/blind75/random", response_model=Problem)
def get_random_problem():
    return random.choice(PROBLEMS)
