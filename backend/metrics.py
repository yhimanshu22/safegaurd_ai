from sqlmodel import Session, select
from .models import Post, Metric, engine

def calculate_metrics():
    """
    Calculates Accuracy, Precision, and Recall based on manual overrides vs. ML labels.
    - Precision: TP / (TP + FP)
    - Recall: TP / (TP + FN)
    - Accuracy: (TP + TN) / total
    """
    with Session(engine) as session:
        # We only calculate metrics for posts that have been manually verified (correct_label is set)
        posts = session.exec(select(Post).where(Post.correct_label != None)).all()
        
        if not posts:
            return None

        tp = fp = tn = fn = 0
        
        for post in posts:
            actual = post.correct_label
            predicted = "TOXIC" if post.status == "TOXIC" else "SAFE"
            
            if actual == "TOXIC" and predicted == "TOXIC":
                tp += 1
            elif actual == "SAFE" and predicted == "TOXIC":
                fp += 1
            elif actual == "SAFE" and predicted == "SAFE":
                tn += 1
            elif actual == "TOXIC" and predicted == "SAFE":
                fn += 1

        total = len(posts)
        accuracy = (tp + tn) / total if total > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0

        metric = Metric(
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            total_samples=total
        )
        session.add(metric)
        session.commit()
        return metric
