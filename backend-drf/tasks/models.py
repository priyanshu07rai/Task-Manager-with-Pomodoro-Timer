from django.db import models
from django.contrib.auth.models import User
from django.forms import TimeField

# Create your models here.

class Tasks(models.Model):
    status_choices = [
        ("pending", "To-Do"), ("ongoing", "In-Progress"), ("completed", "Completed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Tasks")

    task_name = models.CharField(max_length = 250)
    task_description = models.TextField (blank = True)

    status = models.CharField(
        max_length = 10,
        choices = status_choices,
        default = "pending",
        )

    due_time = models.TimeField(
    null=True,
    blank=True
        )
    duration = models.IntegerField(
    default=0
    )

    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)

    def __str__(self):
        return self.Task_Name